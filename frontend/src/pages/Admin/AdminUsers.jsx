import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Eye,
  MoreHorizontal,
  Users,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import { EmptyState, LoadingState } from "../../components/Common/PageStates";
import {
  clearSelectedAdminUser,
  disableAdminUser,
  fetchAdminUserDetails,
  fetchAdminUsers,
  updateAdminUser,
} from "../../features/admin/adminUsersSlice";
import "../../styles/admin/admin-users.css";

function AdminUsers() {
  const dispatch = useDispatch();

  const { users, total, selectedUser, isLoading, isSaving, error } =
    useSelector((state) => state.adminUsers);

  const [searchText, setSearchText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchAdminUsers(searchText));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchText]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  const refreshUsers = () => {
    dispatch(fetchAdminUsers(searchText));
  };

  const handleViewUser = async (userId) => {
    setActionError("");
    setIsViewingUser(true);
    dispatch(clearSelectedAdminUser());

    try {
      await dispatch(fetchAdminUserDetails(userId)).unwrap();
    } catch (message) {
      setActionError(message);
      setIsViewingUser(false);
    }
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setActionError("");

    try {
      await dispatch(
        updateAdminUser({
          userId: editingUser.id,
          data: {
            name: editingUser.name,
            email: editingUser.email,
            isActive: editingUser.isActive,
          },
        }),
      ).unwrap();

      setEditingUser(null);
      refreshUsers();
    } catch (message) {
      setActionError(message);
    }
  };

  const handleDisableUser = async (userId) => {
    const confirmed = window.confirm(
      "Disable this user account and cancel their active membership?",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await dispatch(disableAdminUser(userId)).unwrap();

      setOpenMenuId(null);
      refreshUsers();
    } catch (message) {
      setActionError(message);
    }
  };

  const detailsUser = selectedUser?.user;
  const detailsSubscription = selectedUser?.subscription;

  return (
    <>
      {isViewingUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setIsViewingUser(false);
            dispatch(clearSelectedAdminUser());
          }}
        >
          <section
            className="admin-user-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => {
                setIsViewingUser(false);
                dispatch(clearSelectedAdminUser());
              }}
            >
              <X size={20} />
            </button>

            {!detailsUser ? (
              <LoadingState text="Loading user details..." />
            ) : (
              <>
                <div className="modal-user-avatar">
                  {detailsUser.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>

                <h2>{detailsUser.name}</h2>
                <p className="modal-email">{detailsUser.email}</p>

                <div className="user-detail-list">
                  <div>
                    <span>Membership plan</span>
                    <strong>
                      {detailsSubscription?.plan
                        ? detailsSubscription.plan[0].toUpperCase() +
                          detailsSubscription.plan.slice(1)
                        : "No subscription"}
                    </strong>
                  </div>

                  <div>
                    <span>Selected charity</span>
                    <strong>
                      {detailsUser.selectedCharity?.name || "Not selected"}
                    </strong>
                  </div>

                  <div>
                    <span>Golf scores saved</span>
                    <strong>{selectedUser.totalScores}/5</strong>
                  </div>

                  <div>
                    <span>Account status</span>
                    <strong>
                      {detailsUser.isActive ? "Active" : "Disabled"}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {editingUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setEditingUser(null)}
        >
          <form
            className="admin-user-modal edit-user-modal"
            onSubmit={handleSaveUser}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setEditingUser(null)}
            >
              <X size={20} />
            </button>

            <h2>Edit user</h2>

            <label htmlFor="user-name">Name</label>
            <input
              id="user-name"
              value={editingUser.name}
              onChange={(event) =>
                setEditingUser({
                  ...editingUser,
                  name: event.target.value,
                })
              }
              required
            />

            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              type="email"
              value={editingUser.email}
              onChange={(event) =>
                setEditingUser({
                  ...editingUser,
                  email: event.target.value,
                })
              }
              required
            />

            <label htmlFor="user-status">Account status</label>
            <select
              id="user-status"
              value={editingUser.isActive ? "Active" : "Disabled"}
              onChange={(event) =>
                setEditingUser({
                  ...editingUser,
                  isActive: event.target.value === "Active",
                })
              }
            >
              <option>Active</option>
              <option>Disabled</option>
            </select>

            <button className="save-user-btn" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            {actionError && <p className="auth-form-error">{actionError}</p>}
          </form>
        </div>
      )}

      <main className="admin-users-page">
        <header className="admin-users-header">
          <div>
            <p className="admin-eyebrow">MEMBER MANAGEMENT</p>
            <h1>Users</h1>
            <p>
              View member accounts, subscriptions, selected charities, and
              scores.
            </p>
          </div>
        </header>

        <section className="admin-users-summary">
          <div>
            <Users size={21} />
            <span>
              <strong>{total}</strong>
              Total registered members
            </span>
          </div>

          <div className="admin-user-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search name or email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </section>

        {actionError && !editingUser && (
          <p className="auth-form-error">{actionError}</p>
        )}

        <section className="admin-users-table-section">
          {isLoading && users.length === 0 ? (
            <LoadingState text="Loading users..." />
          ) : (
            <>
              <div className="admin-users-table-wrapper">
                <div className="admin-users-table">
                  <div className="admin-users-table-header">
                    <span>Member</span>
                    <span>Plan</span>
                    <span>Selected charity</span>
                    <span>Scores</span>
                    <span>Joined</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>

                  {users.map((user) => (
                    <div className="admin-users-table-row" key={user.id}>
                      <div className="member-cell">
                        <span className="member-avatar">
                          {user.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>

                        <span>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </span>
                      </div>

                      <span>
                        {user.plan
                          ? user.plan[0].toUpperCase() + user.plan.slice(1)
                          : "—"}
                      </span>

                      <span>{user.charity}</span>
                      <b>{user.scores}/5</b>

                      <span>
                        {new Date(user.joined).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <span
                        className={`user-status ${
                          user.isActive ? "user-active" : "user-lapsed"
                        }`}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>

                      <div className="admin-user-actions">
                        <button
                          title="View user"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye size={17} />
                        </button>

                        <div
                          className="user-more-menu-container"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            title="More options"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === user.id ? null : user.id,
                              )
                            }
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {openMenuId === user.id && (
                            <div className="user-more-menu">
                              <button
                                title="Edit user"
                                onClick={() => {
                                  setEditingUser(user);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                className="delete-user-option"
                                title="Disable user"
                                onClick={() => handleDisableUser(user.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isLoading && users.length === 0 && (
                <EmptyState
                  title="No users found"
                  message="Try another name or email address."
                />
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default AdminUsers;
