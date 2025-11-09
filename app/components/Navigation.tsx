"use client";

import { Flex, Box, Text, Button } from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
import { Workflow, Users, Database, Home } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Leads", path: "/leads", icon: Database },
    { name: "Workflows", path: "/workflows", icon: Workflow },
  ];

  return (
    <Box className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <Flex
        align="center"
        justify="between"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3"
      >
        <Flex align="center" gap="2">
          <Text size="5" weight="bold" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HyperPage
          </Text>
        </Flex>

        <Flex gap="2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "solid" : "soft"}
                color={isActive ? "blue" : "gray"}
                size="2"
                onClick={() => router.push(item.path)}
                className="cursor-pointer"
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Button>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
}
