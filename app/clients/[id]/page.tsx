"use client";

import {
  TextArea,
  TextField,
  Button,
  Dialog,
  AlertDialog,
  Box,
  Text,
  Flex,
} from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { ArrowLeft, Trash2, Edit2 } from "lucide-react";
import Shell from "@/components/Shell";

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
    calendarUrl: "",
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
      calendarUrl: data.client.calendarUrl || "",
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
          calendarUrl: formData.calendarUrl || undefined,
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
        calendarUrl: data.client.calendarUrl || "",
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
      <Shell>
        <div className="v2-container">
          <p className="v2-text-body">Loading client...</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="v2-container">
          <p className="v2-text-body text-red-600">Error: {error.message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="v2-button-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Shell>
      <div className="v2-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="v2-button-secondary flex items-center gap-2"
              data-testid="back-to-clients-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="v2-heading-1" data-testid="client-name-heading">
                {data.client.name}
              </h1>
              <p className="v2-text-small mt-1">
                Created {new Date(data.client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <AlertDialog.Root
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialog.Trigger>
                    <button
                      className="v2-button-secondary flex items-center gap-2"
                      data-testid="delete-client-button"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
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
                <button
                  data-testid="client-edit-button"
                  className="v2-button-primary flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  data-testid="client-cancel-button"
                  className="v2-button-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  data-testid="client-save-button"
                  className="v2-button-primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="v2-card mb-6">
          <h2 className="v2-heading-2 mb-6">About</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Name
              </label>
              <TextField.Root
                data-testid="field-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Website
              </label>
              <TextField.Root
                data-testid="field-website"
                placeholder="example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Industry
              </label>
              <TextField.Root
                data-testid="field-industry"
                placeholder="Technology, Finance, etc."
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="v2-text-small block mb-2 font-medium">
                Company Summary
              </label>
              <TextArea
                data-testid="field-summary"
                placeholder="Brief description of the company..."
                value={formData.companySummary}
                onChange={(e) =>
                  setFormData({ ...formData, companySummary: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
                radius="none"
              />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="v2-card mb-6">
          <h2 className="v2-heading-2 mb-6">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="v2-text-small block mb-2 font-medium">
                Target Customer
              </label>
              <TextArea
                data-testid="field-target"
                placeholder="Who are their target customers?"
                value={formData.targetCustomer}
                onChange={(e) =>
                  setFormData({ ...formData, targetCustomer: e.target.value })
                }
                disabled={!isEditing}
                rows={2}
                radius="none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="v2-text-small block mb-2 font-medium">
                Value Proposition
              </label>
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
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Location
              </label>
              <TextField.Root
                data-testid="field-location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Headcount
              </label>
              <TextField.Root
                data-testid="field-headcount"
                type="number"
                placeholder="Number of employees"
                value={formData.headcount}
                onChange={(e) =>
                  setFormData({ ...formData, headcount: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                LinkedIn URL
              </label>
              <TextField.Root
                data-testid="field-linkedin"
                placeholder="https://linkedin.com/company/..."
                value={formData.linkedinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUrl: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div>
              <label className="v2-text-small block mb-2 font-medium">
                Twitter URL
              </label>
              <TextField.Root
                data-testid="field-twitter"
                placeholder="https://twitter.com/..."
                value={formData.twitterUrl}
                onChange={(e) =>
                  setFormData({ ...formData, twitterUrl: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="v2-text-small block mb-2 font-medium">
                Calendar URL
              </label>
              <TextField.Root
                data-testid="field-calendar"
                placeholder="https://cal.com/your-username/meeting-slug"
                value={formData.calendarUrl}
                onChange={(e) =>
                  setFormData({ ...formData, calendarUrl: e.target.value })
                }
                disabled={!isEditing}
                radius="none"
              />
            </div>
          </div>
        </div>

        <p className="v2-text-small text-center text-gray-500 mt-8">
          Marketing materials and branding assets can be managed through the client profile system.
        </p>
      </div>
    </Shell>
  );
}
