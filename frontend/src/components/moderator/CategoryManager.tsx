import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Safety Updates",
      description: "Emergency alerts and safety information",
      order: 1,
      active: true,
    },
    {
      id: "2",
      name: "Market Prices",
      description: "Current agricultural commodity prices",
      order: 2,
      active: true,
    },
    {
      id: "3",
      name: "Community Notices",
      description: "Local news and community announcements",
      order: 3,
      active: true,
    },
    {
      id: "4",
      name: "Transport Updates",
      description: "Road conditions and transport schedules",
      order: 4,
      active: true,
    },
  ]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (category: Category) => {
    setIsEditing(category.id);
    setEditForm({ name: category.name, description: category.description });
  };

  const handleSaveEdit = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? { ...cat, name: editForm.name, description: editForm.description }
          : cat
      )
    );
    setIsEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    );
  };

  const handleAddNew = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: editForm.name,
      description: editForm.description,
      order: categories.length + 1,
      active: true,
    };
    setCategories([...categories, newCategory]);
    setEditForm({ name: "", description: "" });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Category Management
          </h2>
          <p className="text-muted-foreground">
            Organize content for IVR menu navigation
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 border-l-4 border-l-primary">
          <h3 className="text-lg font-bold text-foreground mb-4">
            New Category
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Category Name</Label>
              <input
                id="new-name"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="e.g., Weather Updates"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <input
                id="new-description"
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Brief description for IVR prompt"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddNew} className="gap-2">
                <Save className="w-4 h-4" />
                Save Category
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setEditForm({ name: "", description: "" });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <Card
              key={category.id}
              className={`p-6 border backdrop-blur-sm transition-all ${
                category.active
                  ? "border-border/50 bg-card/50"
                  : "border-border/30 bg-card/30 opacity-60"
              }`}
            >
              {isEditing === category.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSaveEdit(category.id)}
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(null)}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center gap-4">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {category.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          category.active
                            ? "bg-green-500/20 text-green-600"
                            : "bg-gray-500/20 text-gray-600"
                        }`}
                      >
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      IVR Menu Order: #{category.order}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleToggleActive(category.id)}
                      size="sm"
                      variant="outline"
                    >
                      {category.active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      onClick={() => handleEdit(category)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id)}
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
      </div>

      {/* Info Card */}
      <Card className="p-6 border border-blue-500/30 backdrop-blur-sm bg-blue-500/10">
        <div className="flex items-start gap-4">
          <FolderTree className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-foreground mb-2">
              Category Organization Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Categories appear in IVR menu in the order shown above</li>
              <li>• Drag to reorder (feature coming soon)</li>
              <li>• Inactive categories won't appear in IVR but data is preserved</li>
              <li>• Each category can have multiple briefings assigned to it</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CategoryManager;
