"use client";

// Concrete dashboard layouts (account / seller / admin), each wrapped in the
// appropriate role guard.

import {
  BarChart3, Bell, BookUser, Boxes, Building2, ClipboardList, FolderTree, Heart, Home, ImageIcon,
  LayoutDashboard, Library, MapPin, MessageSquare, Package, Percent, Settings, Star, Store, Tag, User,
  UserCog, Users, Wallet, Warehouse, Zap, LayoutGrid,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout
        title="My Account"
        items={[
          { to: "/account", label: "Dashboard", icon: Home, end: true },
          { to: "/account/orders", label: "Orders", icon: Package },
          { to: "/account/wishlist", label: "Wishlist", icon: Heart },
          { to: "/account/reviews", label: "My Reviews", icon: Star },
          { to: "/account/notifications", label: "Notifications", icon: Bell },
          { to: "/account/addresses", label: "Addresses", icon: MapPin },
          { to: "/account/wallet", label: "Wallet & Points", icon: Wallet },
          { to: "/account/profile", label: "Profile", icon: User },
        ]}
      >
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["seller", "admin"]}>
      <DashboardLayout
        title="Seller Dashboard"
        items={[
          { to: "/seller", label: "Overview", icon: LayoutDashboard, end: true, group: "Shop" },
          { to: "/seller/sales", label: "Sales & analytics", icon: BarChart3, group: "Shop" },
          { to: "/seller/products", label: "Products", icon: Boxes, group: "Catalogue" },
          { to: "/seller/inventory", label: "Inventory", icon: Warehouse, group: "Catalogue" },
          { to: "/seller/orders", label: "Orders", icon: ClipboardList, group: "Fulfilment" },
          { to: "/seller/reviews", label: "Reviews", icon: MessageSquare, group: "Fulfilment" },
          { to: "/seller/profile", label: "Seller profile", icon: Store, group: "Settings" },
        ]}
      >
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <DashboardLayout
        title="Admin Dashboard"
        items={[
          { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true, group: "Overview" },
          { to: "/admin/reports", label: "Reports", icon: BarChart3, group: "Overview" },
          { to: "/admin/orders", label: "Orders", icon: ClipboardList, group: "Commerce" },
          { to: "/admin/customers", label: "Customers", icon: UserCog, group: "Commerce" },
          { to: "/admin/coupons", label: "Coupons", icon: Tag, group: "Commerce" },
          { to: "/admin/discounts", label: "Discounts", icon: Percent, group: "Commerce" },
          { to: "/admin/products", label: "Products", icon: Boxes, group: "Catalogue" },
          { to: "/admin/inventory", label: "Inventory", icon: Warehouse, group: "Catalogue" },
          { to: "/admin/authors", label: "Authors", icon: BookUser, group: "Catalogue" },
          { to: "/admin/publishers", label: "Publishers", icon: Building2, group: "Catalogue" },
          { to: "/admin/categories", label: "Categories", icon: FolderTree, group: "Catalogue" },
          { to: "/admin/catalog", label: "Catalog overview", icon: Library, group: "Catalogue" },
          { to: "/admin/reviews", label: "Reviews", icon: MessageSquare, group: "Catalogue" },
          { to: "/admin/banners", label: "Banners", icon: ImageIcon, group: "Storefront" },
          { to: "/admin/quick-deals", label: "Quick Deals", icon: Zap, group: "Storefront" },
          { to: "/admin/home-collections", label: "Home collections", icon: LayoutGrid, group: "Storefront" },
          { to: "/admin/settings", label: "Settings", icon: Settings, group: "Storefront" },
          { to: "/admin/users", label: "Users & Roles", icon: Users, group: "Access" },
        ]}
      >
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
