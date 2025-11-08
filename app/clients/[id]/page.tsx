"use client";

import {
  Box,
  Flex,
  Card,
  Grid,
  TextArea,
  TextField,
  Button,
  Table,
  Separator,
  Heading,
  Text,
  Dialog,
  AlertDialog,
} from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useState } from "react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = trpc.client.byId.useQuery({ id });
  const updateMutation = trpc.client.update.useMutation();
  const deleteMutation = trpc.client.delete.useMutation();
  const addMarketingMaterialMutation =
    trpc.client.addMarketingMaterial.useMutation();
  const deleteMarketingMaterialMutation =
    trpc.client.deleteMarketingMaterial.useMutation();
  const addBrandingAssetMutation = trpc.client.addBrandingAsset.useMutation();
  const deleteBrandingAssetMutation =
    trpc.client.deleteBrandingAsset.useMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMarketingMaterialDialogOpen, setIsMarketingMaterialDialogOpen] =
    useState(false);
  const [isBrandingAssetDialogOpen, setIsBrandingAssetDialogOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    companySummary: "",
    targetCustomer: "",
    valueProposition: "",
    location: "",
    headcount: "",
    linkedinUrl: "",
    twitterUrl: "",
  });

  const [marketingMaterialForm, setMarketingMaterialForm] = useState({
    title: "",
    description: "",
    url: "",
    assetType: "",
    previewImageUrl: "",
  });

  const [brandingAssetForm, setBrandingAssetForm] = useState({
    url: "",
    assetType: "",
  });

  // Initialize form when data loads
  if (data && !isEditing && formData.name === "") {
    setFormData({
      name: data.client.name || "",
      website: data.client.website || "",
      industry: data.client.industry || "",
      companySummary: data.client.companySummary || "",
      targetCustomer: data.client.targetCustomer || "",
      valueProposition: data.client.valueProposition || "",
      location: data.client.location || "",
      headcount: data.client.headcount?.toString() || "",
      linkedinUrl: data.client.linkedinUrl || "",
      twitterUrl: data.client.twitterUrl || "",
    });
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: formData.name,
          website: formData.website || undefined,
          industry: formData.industry || undefined,
          companySummary: formData.companySummary || undefined,
          targetCustomer: formData.targetCustomer || undefined,
          valueProposition: formData.valueProposition || undefined,
          location: formData.location || undefined,
          headcount: formData.headcount
            ? parseInt(formData.headcount)
            : undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
          twitterUrl: formData.twitterUrl || undefined,
        },
      });
      setIsEditing(false);
      alert("Client updated successfully!");
    } catch (err) {
      alert("Failed to update client");
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        name: data.client.name || "",
        website: data.client.website || "",
        industry: data.client.industry || "",
        companySummary: data.client.companySummary || "",
        targetCustomer: data.client.targetCustomer || "",
        valueProposition: data.client.valueProposition || "",
        location: data.client.location || "",
        headcount: data.client.headcount?.toString() || "",
        linkedinUrl: data.client.linkedinUrl || "",
        twitterUrl: data.client.twitterUrl || "",
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id });
      router.push("/clients");
    } catch (err) {
      alert("Failed to delete client");
      console.error(err);
    }
  };

  const handleAddMarketingMaterial = async () => {
    try {
      await addMarketingMaterialMutation.mutateAsync({
        clientId: id,
        title: marketingMaterialForm.title,
        description: marketingMaterialForm.description || undefined,
        url: marketingMaterialForm.url,
        assetType: marketingMaterialForm.assetType,
        previewImageUrl: marketingMaterialForm.previewImageUrl || undefined,
      });

      setIsMarketingMaterialDialogOpen(false);
      setMarketingMaterialForm({
        title: "",
        description: "",
        url: "",
        assetType: "",
        previewImageUrl: "",
      });
      refetch();
    } catch (err) {
      alert("Failed to add marketing material");
      console.error(err);
    }
  };

  const handleDeleteMarketingMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this marketing material?"))
      return;

    try {
      await deleteMarketingMaterialMutation.mutateAsync({ id: materialId });
      refetch();
    } catch (err) {
      alert("Failed to delete marketing material");
      console.error(err);
    }
  };

  const handleAddBrandingAsset = async () => {
    try {
      await addBrandingAssetMutation.mutateAsync({
        clientId: id,
        url: brandingAssetForm.url,
        assetType: brandingAssetForm.assetType || undefined,
      });

      setIsBrandingAssetDialogOpen(false);
      setBrandingAssetForm({ url: "", assetType: "" });
      refetch();
    } catch (err) {
      alert("Failed to add branding asset");
      console.error(err);
    }
  };

  const handleDeleteBrandingAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this branding asset?"))
      return;

    try {
      await deleteBrandingAssetMutation.mutateAsync({ id: assetId });
      refetch();
    } catch (err) {
      alert("Failed to delete branding asset");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Text color="gray">Loading client...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Text color="red">Error: {error.message}</Text>
        <Button onClick={() => router.push("/clients")} className="mt-4">
          Back to Clients
        </Button>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Flex
        align="center"
        justify="between"
        className="py-6"
        wrap="wrap"
        gap="4"
      >
        <Heading size="8" data-testid="client-name-heading">
          {data.client.name}
        </Heading>
        <Flex gap="3">
          {!isEditing ? (
            <Flex gap="3">
              <Flex gap="3">
                <Box>
                  <Text size="2" weight="medium" color="gray" className="block">
                    Created
                  </Text>
                  <Text size="2">
                    {new Date(data.client.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" weight="medium" color="gray" className="block">
                    Last Updated
                  </Text>
                  <Text size="2">
                    {new Date(data.client.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </Box>
              </Flex>

              <div className="space-y-2 gap-2 flex">
                <Button
                  variant="soft"
                  color="gray"
                  className="w-full"
                  onClick={() => router.push("/clients")}
                  data-testid="back-to-clients-button"
                >
                  ← Back to Clients
                </Button>

                <AlertDialog.Root
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialog.Trigger>
                    <Button
                      variant="soft"
                      color="red"
                      className="w-full"
                      data-testid="delete-client-button"
                    >
                      Delete Client
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content maxWidth="450px">
                    <AlertDialog.Title>Delete Client</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                      Are you sure you want to delete{" "}
                      <strong>{data.client.name}</strong>? This will also delete
                      all associated marketing materials and branding assets.
                      This action cannot be undone.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">
                          Cancel
                        </Button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <Button
                          variant="solid"
                          color="red"
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending
                            ? "Deleting..."
                            : "Delete Client"}
                        </Button>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              </div>
              <Button
                data-testid="client-edit-button"
                variant="surface"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </Flex>
          ) : (
            <>
              <Button
                data-testid="client-cancel-button"
                variant="soft"
                color="gray"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                data-testid="client-save-button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Grid columns="1" gap="4" className="grid-cols-12">
        <Box className="lg:col-span-8 space-y-6">
          {/* About Section */}
          <Card>
            <Heading size="6" mb="4">
              About
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Name
                </Text>
                <TextField.Root
                  data-testid="field-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Website
                </Text>
                <TextField.Root
                  data-testid="field-website"
                  placeholder="example.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Industry
                </Text>
                <TextField.Root
                  data-testid="field-industry"
                  placeholder="Technology, Finance, etc."
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box className="sm:col-span-2">
                <Text size="2" weight="medium" className="block mb-2">
                  Company Summary
                </Text>
                <TextArea
                  data-testid="field-summary"
                  placeholder="Brief description of the company..."
                  value={formData.companySummary}
                  onChange={(e) =>
                    setFormData({ ...formData, companySummary: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                />
              </Box>
            </div>
          </Card>

          {/* Profile Section */}
          <Card>
            <Heading size="6" mb="4">
              Profile
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Box className="sm:col-span-2">
                <Text size="2" weight="medium" className="block mb-2">
                  Target Customer
                </Text>
                <TextArea
                  data-testid="field-target"
                  placeholder="Who are their target customers?"
                  value={formData.targetCustomer}
                  onChange={(e) =>
                    setFormData({ ...formData, targetCustomer: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={2}
                />
              </Box>
              <Box className="sm:col-span-2">
                <Text size="2" weight="medium" className="block mb-2">
                  Value Proposition
                </Text>
                <TextArea
                  data-testid="field-value"
                  placeholder="What unique value do they provide?"
                  value={formData.valueProposition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valueProposition: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  rows={2}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Location
                </Text>
                <TextField.Root
                  data-testid="field-location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Headcount
                </Text>
                <TextField.Root
                  data-testid="field-headcount"
                  type="number"
                  placeholder="Number of employees"
                  value={formData.headcount}
                  onChange={(e) =>
                    setFormData({ ...formData, headcount: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  LinkedIn URL
                </Text>
                <TextField.Root
                  data-testid="field-linkedin"
                  placeholder="https://linkedin.com/company/..."
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Twitter URL
                </Text>
                <TextField.Root
                  data-testid="field-twitter"
                  placeholder="https://twitter.com/..."
                  value={formData.twitterUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterUrl: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </Box>
            </div>
          </Card>

          {/* Marketing Materials Section */}
          <Card className="rounded-lg  p-6" data-testid="materials-table">
            <Flex align="center" justify="between" mb="4">
              <Heading size="6">Marketing Materials</Heading>
              <Dialog.Root
                open={isMarketingMaterialDialogOpen}
                onOpenChange={setIsMarketingMaterialDialogOpen}
              >
                <Dialog.Trigger>
                  <Button
                    size="1"
                    variant="soft"
                    data-testid="add-material-button"
                  >
                    + Add Material
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="500px">
                  <Dialog.Title>Add Marketing Material</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Add a new marketing asset for this client.
                  </Dialog.Description>
                  <div className="space-y-4">
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        Title <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="e.g., Product Demo Video"
                        value={marketingMaterialForm.title}
                        onChange={(e) =>
                          setMarketingMaterialForm({
                            ...marketingMaterialForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        Description
                      </Text>
                      <TextArea
                        placeholder="Brief description of this marketing material..."
                        value={marketingMaterialForm.description}
                        onChange={(e) =>
                          setMarketingMaterialForm({
                            ...marketingMaterialForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        Asset Type <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="e.g., video, blog_post, case_study"
                        value={marketingMaterialForm.assetType}
                        onChange={(e) =>
                          setMarketingMaterialForm({
                            ...marketingMaterialForm,
                            assetType: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        URL <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="https://..."
                        value={marketingMaterialForm.url}
                        onChange={(e) =>
                          setMarketingMaterialForm({
                            ...marketingMaterialForm,
                            url: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        Preview Image URL
                      </Text>
                      <TextField.Root
                        placeholder="https://..."
                        value={marketingMaterialForm.previewImageUrl}
                        onChange={(e) =>
                          setMarketingMaterialForm({
                            ...marketingMaterialForm,
                            previewImageUrl: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </div>
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button
                      onClick={handleAddMarketingMaterial}
                      disabled={
                        !marketingMaterialForm.title ||
                        !marketingMaterialForm.url ||
                        !marketingMaterialForm.assetType ||
                        addMarketingMaterialMutation.isPending
                      }
                    >
                      {addMarketingMaterialMutation.isPending
                        ? "Adding..."
                        : "Add Material"}
                    </Button>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>
            {data.client.marketingMaterials.length === 0 ? (
              <Text color="gray" size="2">
                No marketing materials found.
              </Text>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.client.marketingMaterials.map((material) => (
                    <Table.Row key={material.id}>
                      <Table.RowHeaderCell>
                        {material.title}
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <Text size="2" color="gray">
                          {material.description || "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{material.assetType}</Table.Cell>
                      <Table.Cell>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          View
                        </a>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(material.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="1"
                          variant="ghost"
                          color="red"
                          onClick={() =>
                            handleDeleteMarketingMaterial(material.id)
                          }
                        >
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card>

          {/* Branding Assets Section */}
          <Card>
            <Flex align="center" justify="between" mb="4">
              <Heading size="6">Logos and Branding</Heading>
              <Dialog.Root
                open={isBrandingAssetDialogOpen}
                onOpenChange={setIsBrandingAssetDialogOpen}
              >
                <Dialog.Trigger>
                  <Button
                    size="1"
                    variant="soft"
                    data-testid="add-branding-button"
                  >
                    + Add Asset
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="500px">
                  <Dialog.Title>Add Branding Asset</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Add a new logo or branding asset for this client.
                  </Dialog.Description>
                  <div className="space-y-4">
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        URL <Text color="red">*</Text>
                      </Text>
                      <TextField.Root
                        placeholder="https://..."
                        value={brandingAssetForm.url}
                        onChange={(e) =>
                          setBrandingAssetForm({
                            ...brandingAssetForm,
                            url: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" className="block mb-2">
                        Asset Type
                      </Text>
                      <TextField.Root
                        placeholder="e.g., logo, wordmark, icon"
                        value={brandingAssetForm.assetType}
                        onChange={(e) =>
                          setBrandingAssetForm({
                            ...brandingAssetForm,
                            assetType: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </div>
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button
                      onClick={handleAddBrandingAsset}
                      disabled={
                        !brandingAssetForm.url ||
                        addBrandingAssetMutation.isPending
                      }
                    >
                      {addBrandingAssetMutation.isPending
                        ? "Adding..."
                        : "Add Asset"}
                    </Button>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>
            {data.client.logosAndBranding.length === 0 ? (
              <Text color="gray" size="2">
                No branding assets found.
              </Text>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Asset Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.client.logosAndBranding.map((asset) => (
                    <Table.Row key={asset.id}>
                      <Table.RowHeaderCell>
                        {asset.assetType || "Asset"}
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          View
                        </a>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(asset.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="1"
                          variant="ghost"
                          color="red"
                          onClick={() => handleDeleteBrandingAsset(asset.id)}
                        >
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}
