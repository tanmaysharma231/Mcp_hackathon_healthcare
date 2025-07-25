import { useState } from "react";
import { MessageCircle, TrendingUp, Utensils, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Chat with Agent",
    url: "/",
    icon: MessageCircle,
    emoji: "💬"
  },
  {
    title: "Glucose Trends",
    url: "/trends",
    icon: TrendingUp,
    emoji: "📈"
  },
  {
    title: "Meal Simulator",
    url: "/meal-sim",
    icon: Utensils,
    emoji: "🍽️"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    emoji: "⚙️"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-border bg-gradient-subtle shadow-soft"
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-wellness rounded-lg flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-foreground">GlucoGuide</h2>
                <p className="text-xs text-muted-foreground">AI Agent</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      ${isActive(item.url) 
                        ? "bg-primary/10 text-primary border-r-2 border-r-primary font-medium" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }
                      transition-all duration-200
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <span className="text-base">{item.emoji}</span>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}