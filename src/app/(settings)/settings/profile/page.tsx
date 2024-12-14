"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserContext } from "@/context/UserContext";

export default function ProfilePage() {
  const user = useUserContext(); // Get the Clerk user

  return (
    <div className="space-y-6 w-full">
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Profile Information</CardTitle>
          <CardDescription className="text-gray-500">
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user?.image || "/placeholder.svg"}
                alt="Profile picture"
              />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Change Picture
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              placeholder={`${user?.firstName} ${user?.lastName}` || "John Doe"}
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={user?.email || "john.doe@example.com"}
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder={user?.bio || "Tell us about yourself"}
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Password</CardTitle>
          <CardDescription className="text-gray-500">
            Change your password or enable two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enable Two-Factor Auth
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
