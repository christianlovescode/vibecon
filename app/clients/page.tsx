'use client';

import { Table, Box, Flex, TextField, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { trpc } from '@/trpc/client';

export default function ClientsPage() {
  const { data, isLoading, error } = trpc.client.list.useQuery();

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
        <div className="w-full max-w-md">
          <TextField.Root
            data-testid="clients-search-input"
            placeholder="Search clients..."
            size="2"
          />
        </div>
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
