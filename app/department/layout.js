/* ============================================================
   Department Layout — Passthrough
   
   The shared DashboardLayout handles sidebar, nav, and auth.
   Individual pages use DashboardProtection for role checking.
   This layout is a simple passthrough to avoid double layouts.
   ============================================================ */

export default function DepartmentLayout({ children }) {
    return children;
}
