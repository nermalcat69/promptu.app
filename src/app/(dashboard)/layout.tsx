import React from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";
import { BarChart2, CreditCard, Layout, Settings, Users } from "lucide-react";
import Link from "next/link";
import { DashboardNavButtons } from "@/components/nav-buttons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      <MockNavbar />
      <div className="flex h-full">
        <MockSidebar />
        <div id="main" className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

const MockNavbar = () => {
  return (
    <div id="nav" className="border-b border-dashed bg-[#FBFBFB] flex items-center justify-between">
      <div id="brand" className="h-full md:border-r border-dashed w-[300px] flex items-center justify-center">
        <Button variant="ghost" className="w-full h-full font-heading text-lg md:text-2xl font-bold" asChild>
          <Link href="/">
            <span>KitePortfolio</span>
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-end h-full border-dashed divide-x">
        <DashboardNavButtons />
        <UserProfile className="size-10 md:size-14" />
      </div>
    </div>
  )
}

const MockSidebar = () => {
  return (
    <div id="sidebar" className="w-[300px] border-r border-dashed bg-[#FBFBFB] hidden md:block">
      <div className="flex flex-col divide-y divide-dashed border-b border-dashed">
        <Button variant="ghost" className="border-dashed h-14 text-left justify-start pl-8" asChild>
          <Link href="/dashboard">
            <Layout />
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" className="border-dashed h-14 text-left justify-start pl-8 opacity-50 cursor-not-allowed" disabled asChild>
          <Link href="/settings">
            <Settings />
            <span>Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" className="border-dashed h-14 text-left justify-start pl-8 opacity-50 cursor-not-allowed" disabled asChild>
          <Link href="/analytics">
            <BarChart2 />
            <span>Analytics</span>
          </Link>
        </Button>
        <Button variant="ghost" className="border-dashed h-14 text-left justify-start pl-8 opacity-50 cursor-not-allowed" disabled asChild>
          <Link href="/users">
            <Users />
            <span>Users</span>
          </Link>
        </Button>
        <Button variant="ghost" className="border-dashed h-14 text-left justify-start pl-8 opacity-50 cursor-not-allowed" disabled asChild>
          <Link href="/billing">
            <CreditCard />
            <span>Billing</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}