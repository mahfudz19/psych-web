import React from "react";
import {
  LayoutDashboard,
  BrainCircuit,
  ClipboardList,
  History,
  CreditCard,
  Users,
  Building2,
  ShieldAlert,
} from "lucide-react";

export interface NavItem {
  titleKey: string;
  path?: string;
  icon: React.ReactNode;
  roles?: string[]; // Untuk ["USER", "ORGANIZATION", "SUPERADMIN"]
  orgRoles?: string[]; // Untuk ["owner", "admin", "member"]
  children?: NavItem[];
}

export interface NavGroup {
  groupLabelKey: string;
  roles?: string[];
  orgRoles?: string[];
  items: NavItem[];
}

export const menuConfig: NavGroup[] = [
  {
    groupLabelKey: "sidebar.mainMenu",
    items: [
      {
        titleKey: "sidebar.overview",
        path: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      },
      {
        titleKey: "sidebar.psychTest",
        icon: <BrainCircuit className="w-5 h-5 shrink-0" />,
        children: [
          {
            titleKey: "sidebar.testList",
            path: "/tests",
            icon: <ClipboardList className="w-4 h-4 shrink-0" />,
          },
          {
            titleKey: "sidebar.history",
            path: "/tests/history",
            icon: <History className="w-4 h-4 shrink-0" />,
          },
        ],
      },
      {
        titleKey: "sidebar.billing",
        path: "/billing",
        icon: <CreditCard className="w-5 h-5 shrink-0" />,
      },
    ],
  },
  {
    groupLabelKey: "sidebar.organization",
    items: [
      {
        titleKey: "sidebar.teamMembers",
        path: "/members",
        orgRoles: ["owner", "admin"],
        icon: <Users className="w-5 h-5 shrink-0" />,
      },
      {
        titleKey: "sidebar.organizationSettings",
        path: "/settings",
        orgRoles: ["owner", "admin"],
        icon: <Building2 className="w-5 h-5 shrink-0" />,
      },
    ],
  },
  {
    groupLabelKey: "sidebar.system",
    roles: ["SUPERADMIN"],
    items: [
      {
        titleKey: "sidebar.adminPanel",
        path: "/admin",
        icon: <ShieldAlert className="w-5 h-5 shrink-0" />,
      },
    ],
  },
];
