import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Plus, Pencil, Trash2, Search, X } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/Common/PageStates";
import {
  createAdminCharity,
  fetchAdminCharities,
  removeAdminCharity,
  updateAdminCharity,
} from "../../features/admin/adminCharitiesSlice";
import "../../styles/admin/admin-charities.css";

function AdminCharities() {
  const dispatch = useDispatch();

  const {
    items: charities,
    isLoading,
    isSaving,
    error,
  } = useSelector((state) => state.adminCharities);

  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [actionError, setActionError] = useState("");

  const emptyForm = {
    name: "",
    category: "",
    description: "",
    website: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAdminCharities());
  }, [dispatch]);

  const filteredCharities = charities.filter((charity) =>
    charity.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const openAddForm = () => {
    setEditingCharity(null);
    setActionError("");
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (charity) => {
    setEditingCharity(charity);
    setActionError("");
    setFormData({
      name: charity.name,
      category: charity.category,
      description: charity.description,
      website: charity.website || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setActionError("");

    try {
      if (editingCharity) {
        await dispatch(
          updateAdminCharity({
            charityId: editingCharity._id,
            data: formData,
          }),
        ).unwrap();
      } else {
        await dispatch(createAdminCharity(formData)).unwrap();
      }

      setShowForm(false);
      setEditingCharity(null);
      dispatch(fetchAdminCharities());
    } catch (message) {
      setActionError(message);
    }
  };

  const handleDelete = async (charityId) => {
    const confirmed = window.confirm(
      "Delete this charity? Members will no longer be able to select it.",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await dispatch(removeAdminCharity(charityId)).unwrap();
      dispatch(fetchAdminCharities());
    } catch (message) {
      setActionError(message);
    }
  };

  if (isLoading && charities.length === 0) {
    return <LoadingState text="Loading charities..." />;
  }

  if (error && charities.length === 0) {
    return (
      <ErrorState
        title="Unable to load charities"
        message={error}
        onRetry={() => dispatch(fetchAdminCharities())}
      />
    );
  }

  return (
    <main className="admin-charities-page">
      <header className="admin-charities-header">
        <div>
          <p className="admin-eyebrow">CHARITY MANAGEMENT</p>
          <h1>Charities</h1>
          <p>Add and manage charities available for member contributions.</p>
        </div>

        <button className="add-charity-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add charity
        </button>
      </header>

      <div className="charity-admin-search">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search charities"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {actionError && <p className="auth-form-error">{actionError}</p>}

      {showForm && (
        <section className="charity-form-card">
          <div className="charity-form-heading">
            <div>
              <p className="admin-eyebrow">
                {editingCharity ? "EDIT CHARITY" : "NEW CHARITY"}
              </p>
              <h2>
                {editingCharity ? "Update charity details" : "Add a charity"}
              </h2>
            </div>

            <button type="button" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="charity-form-grid">
              <div>
                <label htmlFor="charityName">Charity name</label>
                <input
                  id="charityName"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({ ...formData, category: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            <label htmlFor="website">Website (optional)</label>
            <input
              id="website"
              type="url"
              placeholder="https://example.org"
              value={formData.website}
              onChange={(event) =>
                setFormData({ ...formData, website: event.target.value })
              }
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="3"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
              required
            />

            <button
              className="save-charity-btn"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingCharity
                  ? "Save changes"
                  : "Add charity"}
            </button>
          </form>
        </section>
      )}

      <section className="admin-charities-grid">
        {filteredCharities.map((charity) => (
          <article className="admin-charity-card" key={charity._id}>
            <div className="admin-charity-icon">
              <Heart size={24} fill="currentColor" />
            </div>

            <div className="admin-charity-card-top">
              <span>{charity.category}</span>

              <div>
                <button onClick={() => openEditForm(charity)} title="Edit">
                  <Pencil size={16} />
                </button>

                <button
                  className="delete-charity-btn"
                  onClick={() => handleDelete(charity._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h2>{charity.name}</h2>
            <p>{charity.description}</p>

            <div className="charity-member-count">
              <strong>{charity.members}</strong>
              Members currently support this charity
            </div>
          </article>
        ))}
      </section>

      {filteredCharities.length === 0 && !isLoading && (
        <EmptyState
          title="No charities found"
          message="Add a new charity or change your search."
        />
      )}
    </main>
  );
}

export default AdminCharities;
