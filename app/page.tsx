"use client";

import { Text, Button, Card, Heading, Box, Flex } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { Workflow, Users, Database, Sparkles } from "lucide-react";
import Navigation from "./components/Navigation";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: "Client Management",
      description: "Manage your clients and their information in one place",
      icon: Users,
      path: "/clients",
      color: "blue",
    },
    {
      title: "Lead Enrichment",
      description: "Upload LinkedIn profiles and enrich them with detailed data",
      icon: Database,
      path: "/leads",
      color: "green",
    },
    {
      title: "Workflow Builder",
      description: "Configure your lead enrichment pipeline with visual workflows",
      icon: Workflow,
      path: "/workflows",
      color: "purple",
    },
  ];

  return (
    <>
      <Navigation />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Flex direction="column" align="center" className="text-center mb-12">
            <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
            <Heading size="9" className="mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HyperPage</span>
            </Heading>
            <Text size="4" color="gray" className="max-w-2xl">
              Outreach that feels like you've read their mind. Build personalized campaigns with AI-powered enrichment.
            </Text>
          </Flex>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.path}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-[var(--accent-9)]"
                  onClick={() => router.push(feature.path)}
                  data-testid={`feature-card-${feature.title.toLowerCase().replace(' ', '-')}`}
                >
                  <Flex direction="column" gap="3" className="p-4">
                    <Box className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 w-fit`}>
                      <Icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                    </Box>
                    <Heading size="5">{feature.title}</Heading>
                    <Text size="2" color="gray">
                      {feature.description}
                    </Text>
                    <Button
                      variant="soft"
                      color={feature.color as any}
                      className="w-full mt-2"
                    >
                      Get Started →
                    </Button>
                  </Flex>
                </Card>
              );
            })}
          </div>
        </Box>
      </div>
    </>
  );
}
