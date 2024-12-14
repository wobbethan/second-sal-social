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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6 w-full">
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">General Settings</CardTitle>
          <CardDescription className="text-gray-500">
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter your company name"
              className="border-gray-200 bg-white text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select>
              <SelectTrigger
                id="timezone"
                className="border-gray-200 bg-white text-gray-900"
              >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time</SelectItem>
                <SelectItem value="pst">Pacific Time</SelectItem>
                {/* Add more timezones as needed */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="notifications" />
            <Label htmlFor="notifications">Enable email notifications</Label>
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
          <CardTitle className="text-gray-900">Subscription</CardTitle>
          <CardDescription className="text-gray-500">
            Manage your subscription and billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Plan</Label>
            <p className="text-sm font-medium">Pro Plan ($49/month)</p>
          </div>
          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <p className="text-sm font-medium">
              Monthly (Next billing date: July 1, 2023)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Change Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
