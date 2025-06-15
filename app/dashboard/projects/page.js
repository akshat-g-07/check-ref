"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createProject, getProjects } from "@/app/actions/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  async function handleCreateProject(formData) {
    setLoading(true);
    const result = await createProject(formData);

    if (result.success) {
      setIsDialogOpen(false);
      await loadProjects(); // Refresh the table
    }

    setLoading(false);
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="border border-gray-700 rounded-lg bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-750">
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow
                key={project.id}
                className="border-gray-700 hover:bg-gray-750"
              >
                <TableCell className="font-medium text-white">
                  {project.name}
                </TableCell>
                <TableCell>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {project.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Project Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
            size="icon"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Project</DialogTitle>
          </DialogHeader>
          <form action={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">
                Project Name
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter project name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-200">
                Project URL
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                required
                placeholder="https://example.com"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
