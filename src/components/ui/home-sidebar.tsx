"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Bell, Home, Plus, TrendingUp, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./button";
import { Card } from "./card";

const followedAccounts = [
  { name: "Sarah Johnson", avatar: "/avatar-1.jpg", status: "Online" },
  { name: "Mike Chen", avatar: "/avatar-2.jpg", status: "Creating bundle" },
  {
    name: "Emily Davis",
    avatar: "/avatar-3.jpg",
    status: "in Dividend Lovers",
  },
  { name: "Alex Thompson", avatar: "/avatar-4.jpg", status: "Offline" },
];

const initialNotifications = [
  {
    id: 1,
    title: "New follower",
    description: "John Doe started following you",
  },
  {
    id: 2,
    title: "Bundle update",
    description: 'Your "Tech Giants" bundle has increased by 5%',
  },
  {
    id: 3,
    title: "New comment",
    description: "Sarah left a comment on your post",
  },
  { id: 4, title: "Market alert", description: "NASDAQ is up by 2% today" },
  {
    id: 5,
    title: "Dividend payout",
    description: "You received a dividend payout from AAPL",
  },
];

export default function SidebarComponent() {
  const [activeTab, setActiveTab] = useState("home");
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleNotificationSheetOpen = (open: boolean) => {
    setIsNotificationSheetOpen(open);
  };

  return (
    <Sidebar className="flex-shrink-0">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center space-x-2 text-blue-600 px-4 py-2"
        >
          <TrendingUp className="h-6 w-6" />
          <span className="text-xl font-bold">
            Second <span className="text-green-500">Salary</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            >
              <Link href="#">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeTab === "bundles"}
              onClick={() => setActiveTab("bundles")}
            >
              <Link href="#">
                <Users className="mr-2 h-4 w-4" />
                View Bundles
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeTab === "income"}
              onClick={() => setActiveTab("income")}
            >
              <Link href="#">
                <Wallet className="mr-2 h-4 w-4" />
                Income Calculator
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Sheet
              open={isNotificationSheetOpen}
              onOpenChange={handleNotificationSheetOpen}
            >
              <SheetTrigger asChild>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                >
                  <div className="flex items-center cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="ml-2 text-red-500">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>
                    Your latest updates and alerts
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {initialNotifications.map((notification) => (
                    <Card key={notification.id} className="p-4">
                      <h3 className="text-sm font-medium">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {notification.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4 px-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-500">
            Followed Accounts
          </h3>
          <ul className="space-y-2">
            {followedAccounts.map((account, index) => (
              <motion.li
                key={account.name}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={account.avatar} alt={account.name} />
                    <AvatarFallback>
                      {account.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {account.status !== "Offline" ? (
                    <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                  ) : (
                    <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{account.name}</span>
                  {account.status === "Online" && (
                    <span className="text-xs text-green-500">Online</span>
                  )}
                  {account.status === "Offline" && (
                    <span className="text-xs text-red-500">Offline</span>
                  )}
                  {account.status === "Creating bundle" && (
                    <Link
                      href="#"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Creating bundle
                    </Link>
                  )}
                  {account.status.startsWith("in ") && (
                    <span className="text-xs">
                      in forum{" "}
                      <Link href="#" className="text-blue-500 hover:underline">
                        {account.status.slice(3)}
                      </Link>
                    </span>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        <div className="px-4 py-2">
          <Button className="w-full bg-green-600 text-white hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Create Bundle
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              John Doe
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  j.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Upgrade to Pro</DropdownMenuItem>
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
