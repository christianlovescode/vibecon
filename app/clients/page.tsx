'use client';

import { Table, Box, Flex, TextField, Heading, Text, Button, Dialog, TextArea } from '@radix-ui/themes';
import Link from 'next/link';
import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const router = useRouter();
  const { data, isLoading, error } = trpc.client.list.useQuery();
  const createMutation = trpc.client.create.useMutation();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const resetForm = () => {
    setFormData({
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
  };

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync({
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
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Navigate to the newly created client
      router.push(`/clients/${result.client.id}`);
    } catch (err) {
      alert('Failed to create client');
      console.error(err);
    }
  };

  return (
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Flex align="center" justify="between" className="py-6" wrap="wrap" gap="4">
        <div>
          <Heading size="8" data-testid="clients-page-heading">
            Clients
          </Heading>
          <Text size="2" color="gray" className="mt-2">
            Manage your client relationships and information
          </Text>
        </div>
        <Flex gap="3" className="w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial sm:w-64">
            <TextField.Root
              data-testid="clients-search-input"
              placeholder="Search clients..."
              size="2"
            />
          </div>
          <Dialog.Root open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Dialog.Trigger>
              <Button data-testid="create-client-button" size="2">
                + Create Client
              </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="600px">
              <Dialog.Title>Create New Client</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                Add a new client to your workspace.
              </Dialog.Description>

              <div className="space-y-4">
                <Box>
                  <Text size="2" weight="medium" className="block mb-2">
                    Name <Text color="red">*</Text>
                  </Text>
                  <TextField.Root
                    data-testid="create-field-name"
                    placeholder="Client name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Box>

                <div className="grid grid-cols-2 gap-4">
                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Website
                    </Text>
                    <TextField.Root
                      data-testid="create-field-website"
                      placeholder="example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Industry
                    </Text>
                    <TextField.Root
                      data-testid="create-field-industry"
                      placeholder="Technology, Finance, etc."
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </Box>
                </div>

                <Box>
                  <Text size="2" weight="medium" className="block mb-2">
                    Company Summary
                  </Text>
                  <TextArea
                    data-testid="create-field-summary"
                    placeholder="Brief description of the company..."
                    value={formData.companySummary}
                    onChange={(e) => setFormData({ ...formData, companySummary: e.target.value })}
                    rows={3}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" className="block mb-2">
                    Target Customer
                  </Text>
                  <TextArea
                    data-testid="create-field-target"
                    placeholder="Who are their target customers?"
                    value={formData.targetCustomer}
                    onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                    rows={2}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" className="block mb-2">
                    Value Proposition
                  </Text>
                  <TextArea
                    data-testid="create-field-value"
                    placeholder="What unique value do they provide?"
                    value={formData.valueProposition}
                    onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                    rows={2}
                  />
                </Box>

                <div className="grid grid-cols-2 gap-4">
                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Location
                    </Text>
                    <TextField.Root
                      data-testid="create-field-location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Headcount
                    </Text>
                    <TextField.Root
                      data-testid="create-field-headcount"
                      type="number"
                      placeholder="Number of employees"
                      value={formData.headcount}
                      onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                    />
                  </Box>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      LinkedIn URL
                    </Text>
                    <TextField.Root
                      data-testid="create-field-linkedin"
                      placeholder="https://linkedin.com/company/..."
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Twitter URL
                    </Text>
                    <TextField.Root
                      data-testid="create-field-twitter"
                      placeholder="https://twitter.com/..."
                      value={formData.twitterUrl}
                      onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    />
                  </Box>
                </div>
              </div>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray" data-testid="create-cancel-button">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || createMutation.isPending}
                  data-testid="create-submit-button"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Client'}
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>

      {isLoading && (
        <Box
          className="rounded-lg border p-8 text-center"
          style={{ borderColor: 'var(--border)' }}
          data-testid="clients-loading"
        >
          <Text color="gray">Loading clients...</Text>
        </Box>
      )}

      {error && (
        <Box
          className="rounded-lg border p-8 text-center"
          style={{ borderColor: 'var(--danger)' }}
          data-testid="clients-error"
        >
          <Text color="red">Error loading clients: {error.message}</Text>
        </Box>
      )}

      {data && data.clients.length === 0 && (
        <Box
          className="rounded-lg border p-8 text-center"
          style={{ borderColor: 'var(--border)' }}
          data-testid="clients-empty"
        >
          <Text color="gray">No clients found. Create your first client to get started.</Text>
        </Box>
      )}

      {data && data.clients.length > 0 && (
        <Box
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
          data-testid="clients-table"
        >
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Website</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.clients.map((client) => (
                <Table.Row
                  key={client.id}
                  className="group hover:bg-[var(--muted-bg)] transition-colors"
                  data-testid={`client-row-${client.id}`}
                >
                  <Table.RowHeaderCell>
                    <Link
                      data-testid="client-row-link"
                      href={`/clients/${client.id}`}
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      {client.name}
                    </Link>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    {client.website ? (
                      <a
                        href={`https://${client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent)] hover:underline"
                        data-testid="client-website-link"
                      >
                        {client.website}
                      </a>
                    ) : (
                      <Text color="gray">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">
                      {new Date(client.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </Table.Cell>
                  <Table.Cell className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <Text color="gray">→</Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
