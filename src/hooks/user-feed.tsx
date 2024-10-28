import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Bell,
  Eye,
  Flag,
  Heart,
  Home,
  MessageCircle,
  Plus,
  Search,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const stockData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
];

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

export default function UserFeed() {
  const [activeTab, setActiveTab] = useState("home");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotificationSheetOpen = (open: boolean) => {
    setIsNotificationSheetOpen(open);
    if (open) {
      setNotifications([]);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100">
        {/* Left Sidebar */}
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
                      <span className="text-sm font-medium">
                        {account.name}
                      </span>
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
                          in{" "}
                          <Link
                            href="#"
                            className="text-blue-500 hover:underline"
                          >
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

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-hidden mr-80">
          {" "}
          {/* Added mr-80 to account for the fixed sidebar width */}
          <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search posts, bundles, or users..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {" "}
              {[
                {
                  icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
                  title: "Market News: Fed Announces Rate Cut",
                  content:
                    "The Federal Reserve has announced a 0.25% rate cut. 📉",
                },
                {
                  avatar: "/placeholder-avatar.jpg",
                  name: "Jane Doe",
                  username: "@janedoe",
                  content:
                    "Just read an interesting article on the potential impact of AI on the stock market. Thoughts? 🤖📈 #AIStocks #FinTech",
                },
                {
                  icon: <Users className="h-8 w-8 text-purple-500" />,
                  title: "New Bundle: Emerging Markets Opportunity",
                  content:
                    "Your friend Michael just created a new bundle focused on high-growth emerging market stocks. 🌍📊",
                },
                {
                  icon: <TrendingUp className="h-8 w-8 text-green-500" />,
                  title: "Tech Titans Bundle is trending!",
                  content:
                    "This bundle has gained 15% in the last 24 hours. 🚀",
                },
                {
                  avatar: "/placeholder-avatar-3.jpg",
                  name: "Emily Wong",
                  username: "@emilywong",
                  content:
                    'Just launched my "Green Energy Futures" bundle! Focusing on companies leading the charge in renewable energy. Check it out! 🌿⚡ #GreenInvesting #CleanEnergy',
                  image:
                    "https://kundkundtc.com/wp-content/uploads/2022/01/best-green-energy-stocks-in-india.jpg",
                },
                {
                  avatar: "/placeholder-avatar-2.jpg",
                  name: "Alex Smith",
                  username: "@alexsmith",
                  content:
                    "My dividend portfolio is up 8% this quarter. Slow and steady wins the race! 🐢💰 #DividendInvesting #FinancialFreedom",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      {item.avatar ? (
                        <>
                          <div className="flex items-center space-x-4 mb-2">
                            <Avatar>
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback>
                                {item.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-blue-500">
                                {item.username}
                              </p>
                            </div>
                          </div>
                          <p className="mb-2">
                            {item.content.split(" ").map((word, i) =>
                              word.startsWith("#") ? (
                                <span key={i} className="text-blue-500">
                                  {word}{" "}
                                </span>
                              ) : (
                                word + " "
                              )
                            )}
                          </p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt="Post image"
                              className="w-[30%] h-auto rounded-lg mb-2 se"
                            />
                          )}
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Heart className="mr-1 h-4 w-4" /> Like
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-1 h-4 w-4" /> Reply
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="mr-1 h-4 w-4" /> Share
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center space-x-4">
                          {item.icon}
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-500">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l p-4 flex-shrink-0 overflow-y-auto fixed right-0 top-0 h-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">AAPL Stock</h2>
                <div className="w-full" style={{ minHeight: "200px" }}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">Top Movers</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>TSLA</span>
                    <span className="text-green-500">+5.67%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>AMZN</span>
                    <span className="text-red-500">-2.34%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>GOOGL</span>
                    <span className="text-green-500">+1.23%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">Suggested Forums</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span className="text-blue-600">Dividend Lovers</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Visit
                    </Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-blue-600">High Yield Kings</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Visit
                    </Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-blue-600">
                      Tech Stock Enthusiasts
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Visit
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">Trending Bundles</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span className="text-green-600">AI Revolution</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      1.2k saves
                      <Flag className="h-4 w-4" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-green-600">Sustainable Energy</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      3.5k likes
                      <Heart className="h-4 w-4" />
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-green-600">Crypto Innovators</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      10k views
                      <Eye className="h-4 w-4" />
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </aside>
      </div>
    </SidebarProvider>
  );
}
