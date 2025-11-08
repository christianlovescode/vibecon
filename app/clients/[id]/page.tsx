'use client';

import { Box, Flex, Grid, TextArea, TextField, Button, Table, Separator, Heading, Text } from '@radix-ui/themes';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useState } from 'react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = trpc.client.byId.useQuery({ id });
  const updateMutation = trpc.client.update.useMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    companySummary: '',
    targetCustomer: '',
    valueProposition: '',
    location: '',
    headcount: '',
    linkedinUrl: '',
    twitterUrl: '',
  });

  // Initialize form when data loads
  if (data && !isEditing && formData.name === '') {
    setFormData({
      name: data.client.name || '',
      website: data.client.website || '',
      industry: data.client.industry || '',
      companySummary: data.client.companySummary || '',
      targetCustomer: data.client.targetCustomer || '',
      valueProposition: data.client.valueProposition || '',
      location: data.client.location || '',
      headcount: data.client.headcount?.toString() || '',
      linkedinUrl: data.client.linkedinUrl || '',
      twitterUrl: data.client.twitterUrl || '',
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
          headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
          twitterUrl: formData.twitterUrl || undefined,
        },
      });
      setIsEditing(false);
      alert('Client updated successfully!');
    } catch (err) {
      alert('Failed to update client');
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        name: data.client.name || '',
        website: data.client.website || '',
        industry: data.client.industry || '',
        companySummary: data.client.companySummary || '',
        targetCustomer: data.client.targetCustomer || '',
        valueProposition: data.client.valueProposition || '',
        location: data.client.location || '',
        headcount: data.client.headcount?.toString() || '',
        linkedinUrl: data.client.linkedinUrl || '',
        twitterUrl: data.client.twitterUrl || '',
      });
    }
    setIsEditing(false);
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
        <Button onClick={() => router.push('/clients')} className="mt-4">
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
      <Flex align="center" justify="between" className="py-6" wrap="wrap" gap="4">
        <Heading size="8" data-testid="client-name-heading">
          {data.client.name}
        </Heading>
        <Flex gap="3">
          {!isEditing ? (
            <Button
              data-testid="client-edit-button"
              variant="surface"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
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
                color="teal"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Grid columns="1" gap="4" className="lg:grid lg:grid-cols-12 lg:gap-6">
        <Box className="lg:col-span-8 space-y-6">
          {/* About Section */}
          <section
            className="rounded-lg border p-6"
            style={{ borderColor: 'var(--border)' }}
            data-testid="about-section"
          >
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, companySummary: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </Box>
            </div>
          </section>

          {/* Profile Section */}
          <section
            className="rounded-lg border p-6"
            style={{ borderColor: 'var(--border)' }}
            data-testid="profile-section"
          >
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
                  onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  disabled={!isEditing}
                />
              </Box>
            </div>
          </section>

          {/* Marketing Materials Section */}
          <section
            className="rounded-lg border p-6"
            style={{ borderColor: 'var(--border)' }}
            data-testid="materials-table"
          >
            <Heading size="6" mb="4">
              Marketing Materials
            </Heading>
            {data.client.marketingMaterials.length === 0 ? (
              <Text color="gray" size="2">
                No marketing materials found.
              </Text>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.client.marketingMaterials.map((material) => (
                    <Table.Row key={material.id}>
                      <Table.RowHeaderCell>{material.title}</Table.RowHeaderCell>
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
                        {new Date(material.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </section>

          {/* Branding Assets Section */}
          <section
            className="rounded-lg border p-6"
            style={{ borderColor: 'var(--border)' }}
            data-testid="assets-table"
          >
            <Heading size="6" mb="4">
              Logos and Branding
            </Heading>
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
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.client.logosAndBranding.map((asset) => (
                    <Table.Row key={asset.id}>
                      <Table.RowHeaderCell>{asset.assetType || 'Asset'}</Table.RowHeaderCell>
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
                        {new Date(asset.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </section>
        </Box>

        {/* Sidebar with metadata */}
        <Box className="lg:col-span-4 space-y-6">
          <section
            className="rounded-lg border p-6"
            style={{ borderColor: 'var(--border)' }}
            data-testid="meta-section"
          >
            <Heading size="6" mb="4">
              Metadata
            </Heading>
            <div className="space-y-3">
              <Box>
                <Text size="2" weight="medium" color="gray" className="block">
                  Created
                </Text>
                <Text size="2">
                  {new Date(data.client.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Box>
              <Box>
                <Text size="2" weight="medium" color="gray" className="block">
                  Last Updated
                </Text>
                <Text size="2">
                  {new Date(data.client.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Box>
            </div>
            <Separator className="my-4" />
            <Button
              variant="soft"
              color="gray"
              className="w-full"
              onClick={() => router.push('/clients')}
              data-testid="back-to-clients-button"
            >
              ← Back to Clients
            </Button>
          </section>
        </Box>
      </Grid>
    </Box>
  );
}
