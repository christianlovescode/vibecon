'use client';

import { Text, Button, Card, Heading, Box } from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState(1);

  // Query from Foo Router
  const fooGreeting = trpc.foo.greeting.useQuery({ name: name || undefined });
  const fooItems = trpc.foo.getItems.useQuery();

  // Query from Bar Router
  const barStats = trpc.bar.getStats.useQuery();
  const barUser = trpc.bar.getUserById.useQuery({ userId });

  // Mutations
  const createItem = trpc.foo.createItem.useMutation();
  const updateStatus = trpc.bar.updateStatus.useMutation();

  const handleCreateItem = async () => {
    await createItem.mutateAsync({
      name: 'New Item',
      description: 'Created from the UI',
    });
    alert('Item created!');
  };

  const handleUpdateStatus = async () => {
    await updateStatus.mutateAsync({
      status: 'active',
      message: 'Status updated from UI',
    });
    alert('Status updated!');
  };

  return (
    <div className="flex flex-col min-h-screen p-8 bg-zinc-50 font-sans">
      <Heading size="8" mb="6">tRPC Demo</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl">
        {/* Foo Router Section */}
        <Card>
          <Heading size="6" mb="4">Foo Router</Heading>
          
          <Box mb="4">
            <Text weight="bold" size="3">Greeting Query</Text>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded mt-2 mb-2"
            />
            {fooGreeting.data && (
              <Text size="2">
                {fooGreeting.data.message}
              </Text>
            )}
          </Box>

          <Box mb="4">
            <Text weight="bold" size="3">Items Query</Text>
            {fooItems.data?.items.map((item) => (
              <div key={item.id} className="p-2 bg-zinc-100 rounded mt-2">
                <Text size="2" weight="bold">{item.name}</Text>
                <Text size="1" className="block">{item.description}</Text>
              </div>
            ))}
          </Box>

          <Button onClick={handleCreateItem} disabled={createItem.isPending}>
            {createItem.isPending ? 'Creating...' : 'Create Item (Mutation)'}
          </Button>
        </Card>

        {/* Bar Router Section */}
        <Card>
          <Heading size="6" mb="4">Bar Router</Heading>
          
          <Box mb="4">
            <Text weight="bold" size="3">Stats Query</Text>
            {barStats.data && (
              <div className="mt-2 space-y-1">
                <Text size="2" className="block">Total Users: {barStats.data.totalUsers}</Text>
                <Text size="2" className="block">Active Users: {barStats.data.activeUsers}</Text>
                <Text size="2" className="block">Total Posts: {barStats.data.totalPosts}</Text>
              </div>
            )}
          </Box>

          <Box mb="4">
            <Text weight="bold" size="3">User Query</Text>
            <input
              type="number"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full p-2 border rounded mt-2 mb-2"
            />
            {barUser.data && (
              <div className="p-2 bg-zinc-100 rounded">
                <Text size="2" className="block">Name: {barUser.data.name}</Text>
                <Text size="1" className="block">Email: {barUser.data.email}</Text>
              </div>
            )}
          </Box>

          <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? 'Updating...' : 'Update Status (Mutation)'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
