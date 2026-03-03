import { useMemo, useState, useEffect } from "react";
import Hsidebar from "@/components/dashboard/hsidebar";
import DataTable from "react-data-table-component";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    active: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle size={14} />,
    },
    suspended: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle size={14} />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock size={14} />,
    },
    default: { color: "bg-gray-100 text-gray-700", icon: null },
  };
  const { color, icon } = config[status] || config.default;

  return (
    <span
      className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full capitalize ${color}`}
    >
      {icon} {t(`userManagement.status.${status}`)}
    </span>
  );
};

const RoleTag = ({ role }) => {
  const { t } = useTranslation();
  return (
    <span className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 capitalize">
      {t(`userManagement.roles.${role}`)}
    </span>
  );
};

// Transform Supabase user data to display format
function transformUserData(user: User) {
  return {
    id: user.id,
    name: user.full_name || user.email.split("@")[0],
    email: user.email,
    role: user.role,
    status: user.status, // You can add status field to user metadata if needed
    registered: user.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : "-",
  };
}

function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<ReturnType<typeof transformUserData>[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const allUsers = await userService.getAllUsers();
        console.log("Fetched users:", allUsers);
        const transformedUsers = allUsers.map(transformUserData);
        setUsers(transformedUsers);
      } catch (err: any) {
        setError(t("userManagement.error"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: t("userManagement.columns.name"),
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: t("userManagement.columns.email"),
        selector: (row) => row.email,
        sortable: true,
      },
      {
        name: t("userManagement.columns.role"),
        selector: (row) => row.role,
        cell: (row) => <RoleTag role={row.role} />,
      },
      {
        name: t("userManagement.columns.status"),
        selector: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        name: t("userManagement.columns.registered"),
        selector: (row) => row.registered,
        sortable: true,
      },
      {
        name: t("userManagement.columns.actions"),
        cell: (row) => (
          <Link
            to={`/dashboard/user-details/${row.id}`}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
          >
            {t("userManagement.viewDetails")}
          </Link>
        ),
      },
    ],
    [t],
  );

  const filteredData = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter, users]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    };
  }, [users]);

  return (
    <Hsidebar>
      <h3 className="text-2xl font-semibold mb-6">
        {t("userManagement.title")}
      </h3>
      <div className="p-6 space-y-6 w-full">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-600">
            {t("userManagement.loading")}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={t("userManagement.stats.totalUsers")}
                value={stats.total}
              />
              <StatCard
                label={t("userManagement.stats.active")}
                value={stats.active}
                color="text-green-600"
              />
              <StatCard
                label={t("userManagement.stats.suspended")}
                value={stats.suspended}
                color="text-red-600"
              />
            </div>

            {/* Filters */}
            <div className="p-4 bg-white rounded-lg shadow flex flex-wrap gap-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("userManagement.filters.searchPlaceholder")}
                  className="pl-8 pr-3 py-2 border rounded w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg
                  className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>

              <select
                className="px-3 py-2 border rounded"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">{t("userManagement.filters.allRoles")}</option>
                <option value="user">{t("userManagement.filters.user")}</option>
                <option value="admin">
                  {t("userManagement.filters.admin")}
                </option>
                <option value="provider">
                  {t("userManagement.roles.provider")}
                </option>
              </select>

              <select
                className="px-3 py-2 border rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">
                  {t("userManagement.filters.allStatus")}
                </option>
                <option value="active">
                  {t("userManagement.filters.active")}
                </option>
                <option value="suspended">
                  {t("userManagement.filters.suspended")}
                </option>
                <option value="pending">
                  {t("userManagement.filters.pending")}
                </option>
              </select>
            </div>

            {/* Table */}
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {filteredData.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to={`/dashboard/user-details/${user.id}`}
                      className="ml-3 flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {t("userManagement.viewDetails")}
                    </Link>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-wrap items-center gap-2">
                    <RoleTag role={user.role} />
                    <StatusBadge status={user.status} />
                    <span className="ml-auto text-xs text-gray-500">
                      {user.registered}
                    </span>
                  </div>
                </div>
              ))}
              {filteredData.length === 0 && (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center text-gray-500 text-sm">
                  {t("userManagement.noUsers", "No users found")}
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white p-4 rounded-lg shadow">
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                highlightOnHover
                striped
                dense
              />
            </div>
          </>
        )}
      </div>
    </Hsidebar>
  );
}

function StatCard({ label, value, color = "text-blue-600" }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow flex flex-col items-start">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default UserManagement;
