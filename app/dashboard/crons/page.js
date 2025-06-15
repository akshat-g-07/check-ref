"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Clock,
  Copy,
  Edit,
  Eye,
  Play,
  Plus,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createCron,
  getCrons,
  runSingleCron,
  toggleArchiveCron,
  updateCron,
} from "@/app/actions/crons";
import { getProjects } from "@/app/actions/projects";

export default function CronsPage() {
  const [crons, setCrons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningCronId, setRunningCronId] = useState(null);
  const [selectedCron, setSelectedCron] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cronsData, projectsData] = await Promise.all([
      getCrons(),
      getProjects(),
    ]);
    setCrons(cronsData);
    setProjects(projectsData);

    // Open all accordions by default
    const accordions = {};
    projectsData.forEach((project) => {
      accordions[project.name] = true;
    });
    setOpenAccordions(accordions);
  }

  async function handleCreateCron(formData) {
    setLoading(true);
    const result = await createCron(formData);

    if (result.success) {
      setIsCreateDialogOpen(false);
      await loadData();
    }

    setLoading(false);
  }

  async function handleEditCron(formData) {
    if (!selectedCron) return;

    setLoading(true);
    const result = await updateCron(selectedCron.id, formData);

    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedCron(null);
      await loadData();
    }

    setLoading(false);
  }
  async function handleToggleArchive(cronId) {
    setLoading(true);
    await toggleArchiveCron(cronId);
    await loadData();
    setLoading(false);
  }

  async function handleRunCron(cronId) {
    setRunningCronId(cronId);
    const result = await runSingleCron(cronId);

    if (result.success) {
      // Reload data to get updated response
      await loadData();
      // Find the updated cron and open response dialog
      const updatedCron = result.cron;
      setSelectedCron(updatedCron);
      setIsResponseDialogOpen(true);
    }

    setRunningCronId(null);
  }

  function toggleAccordion(projectName) {
    setOpenAccordions((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }));
  }

  function openResponseDialog(cron) {
    setSelectedCron(cron);
    setIsResponseDialogOpen(true);
  }

  function openEditDialog(cron) {
    setSelectedCron(cron);
    setIsEditDialogOpen(true);
  }

  function copyResponseData() {
    if (selectedCron?.responseData) {
      navigator.clipboard.writeText(
        JSON.stringify(selectedCron.responseData, null, 2)
      );
    }
  }

  // Group crons by project
  const cronsByProject = {};
  projects.forEach((project) => {
    cronsByProject[project.name] = {
      project,
      activeCrons: crons.filter(
        (cron) => cron.projectName === project.name && !cron.isArchived
      ),
      archivedCrons: crons.filter(
        (cron) => cron.projectName === project.name && cron.isArchived
      ),
    };
  });

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Cron Jobs</h1>
      </div>

      {/* Projects with Crons */}
      <Accordion>
        {projects.map((project) => {
          const projectCrons = cronsByProject[project.name];
          const totalCrons =
            projectCrons.activeCrons.length + projectCrons.archivedCrons.length;

          if (totalCrons === 0) return null;

          return (
            <AccordionItem key={project.name} value={project.name}>
              <AccordionTrigger
                onClick={() => toggleAccordion(project.name)}
                isOpen={openAccordions[project.name]}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>{project.name}</span>
                  <span className="text-sm text-gray-400">
                    ({totalCrons} crons)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent isOpen={openAccordions[project.name]}>
                <div className="space-y-3">
                  {" "}
                  {/* Active Crons */}
                  {projectCrons.activeCrons.map((cron) => (
                    <CronCard
                      key={cron.id}
                      cron={cron}
                      onResponse={() => openResponseDialog(cron)}
                      onEdit={() => openEditDialog(cron)}
                      onArchive={() => handleToggleArchive(cron.id)}
                      onRun={() => handleRunCron(cron.id)}
                      loading={loading}
                      isRunning={runningCronId === cron.id}
                    />
                  ))}
                  {/* Archived Crons */}
                  {projectCrons.archivedCrons.map((cron) => (
                    <CronCard
                      key={cron.id}
                      cron={cron}
                      onResponse={() => openResponseDialog(cron)}
                      onEdit={() => openEditDialog(cron)}
                      onArchive={() => handleToggleArchive(cron.id)}
                      onRun={() => handleRunCron(cron.id)}
                      loading={loading}
                      isRunning={runningCronId === cron.id}
                      isArchived
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Create Cron Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
            size="icon"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl h-125 overflow-y-auto top-1/10 translate-y-0 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">
              Create New Cron Job
            </DialogTitle>
          </DialogHeader>
          <CronForm
            projects={projects}
            onSubmit={handleCreateCron}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Cron Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Cron Job</DialogTitle>
          </DialogHeader>
          {selectedCron && (
            <CronForm
              projects={projects}
              onSubmit={handleEditCron}
              loading={loading}
              initialData={selectedCron}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Cron Response: {selectedCron?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCron && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCron.responseType === "success"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {selectedCron.responseType || "No response yet"}
                </div>
                {selectedCron.lastRunAt && (
                  <span className="text-sm text-gray-400">
                    Last run:{" "}
                    {new Date(selectedCron.lastRunAt).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-200">Response Data</Label>
                  <Button
                    onClick={copyResponseData}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-300">
                    {selectedCron.responseData
                      ? JSON.stringify(selectedCron.responseData, null, 2)
                      : "No response data available"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CronCard({
  cron,
  onResponse,
  onEdit,
  onArchive,
  onRun,
  loading,
  isRunning = false,
  isArchived = false,
}) {
  return (
    <div
      className={`border border-gray-600 rounded-lg p-4 ${isArchived ? "opacity-75 bg-gray-850" : "bg-gray-700"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-white mb-1">{cron.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{cron.url}</p>
          {cron.comments && (
            <p className="text-sm text-gray-300 mb-2">{cron.comments}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{cron.method}</span>
            {cron.lastRunAt && (
              <span>
                • Last run: {new Date(cron.lastRunAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={onResponse}
            variant="outline"
            size="sm"
            className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={onRun}
            disabled={isRunning || isArchived}
            variant="outline"
            size="sm"
            className="bg-green-600 border-green-500 text-white hover:bg-green-500 disabled:bg-gray-600 disabled:border-gray-500"
          >
            {isRunning ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={onArchive}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
          >
            {isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CronForm({
  projects,
  onSubmit,
  loading,
  initialData = null,
  isEdit = false,
}) {
  const [selectedProject, setSelectedProject] = useState(
    initialData?.projectName || ""
  );
  const [selectedMethod, setSelectedMethod] = useState(
    initialData?.method || "GET"
  );
  const [projectUrl, setProjectUrl] = useState("");

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.name === selectedProject);
      setProjectUrl(project?.url || "");
    }
  }, [selectedProject, projects]);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await onSubmit(formData);
  }

  // Check if method allows body (not GET or DELETE)
  const allowsBody = !["GET", "DELETE"].includes(selectedMethod);

  // Show basic fields only after project is selected
  const showBasicFields = selectedProject || isEdit;

  // Check if form is valid for submission
  const isFormValid = selectedProject && (isEdit || !loading);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 flex-1 flex flex-col justify-between"
    >
      {/* Project Selection - Always visible first */}
      <div className="flex space-x-4">
        <Label htmlFor="projectName" className="text-gray-200">
          Project *
        </Label>
        <Select
          name="projectName"
          value={selectedProject}
          onValueChange={setSelectedProject}
          required
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select a project first..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {projects.map((project) => (
              <SelectItem
                key={project.name}
                value={project.name}
                className="text-white hover:bg-gray-600"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show remaining fields only after project is selected */}
      {showBasicFields && (
        <>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Cron Job Name *
            </Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={initialData?.name || ""}
              placeholder="Enter descriptive name for this cron job"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </div>

          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-gray-200">
              URL *
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              required
              key={projectUrl} // Force re-render when project changes
              defaultValue={initialData?.url || projectUrl}
              placeholder="https://example.com/api/endpoint"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </div>

          {/* Method Field */}
          <div className="space-y-2">
            <Label htmlFor="method" className="text-gray-200">
              HTTP Method *
            </Label>
            <Select
              name="method"
              value={selectedMethod}
              onValueChange={setSelectedMethod}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem
                  value="GET"
                  className="text-white hover:bg-gray-600"
                >
                  GET
                </SelectItem>
                <SelectItem
                  value="POST"
                  className="text-white hover:bg-gray-600"
                >
                  POST
                </SelectItem>
                <SelectItem
                  value="PUT"
                  className="text-white hover:bg-gray-600"
                >
                  PUT
                </SelectItem>
                <SelectItem
                  value="DELETE"
                  className="text-white hover:bg-gray-600"
                >
                  DELETE
                </SelectItem>
                <SelectItem
                  value="PATCH"
                  className="text-white hover:bg-gray-600"
                >
                  PATCH
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Headers Field - Always show but with appropriate placeholder */}
          <div className="space-y-2">
            <Label htmlFor="headers" className="text-gray-200">
              Headers (JSON format) - Optional
            </Label>
            <textarea
              id="headers"
              name="headers"
              rows={2}
              defaultValue={
                initialData?.headers
                  ? JSON.stringify(initialData.headers, null, 2)
                  : ""
              }
              placeholder={
                selectedMethod === "GET"
                  ? 'Usually not needed for GET requests. Example: {"Authorization": "Bearer token"}'
                  : '{"Content-Type": "application/json", "Authorization": "Bearer token"}'
              }
              className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 rounded-md px-3 py-2"
            />
          </div>

          {/* Request Body - Only show for methods that support body */}
          {allowsBody && (
            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-200">
                Request Body - Optional
              </Label>
              <textarea
                id="body"
                name="body"
                rows={3}
                defaultValue={initialData?.body || ""}
                placeholder='{"key": "value", "data": "example"}'
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 rounded-md px-3 py-2"
              />
            </div>
          )}

          {/* Comments Field */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-gray-200">
              Comments - Optional
            </Label>
            <textarea
              id="comments"
              name="comments"
              rows={2}
              defaultValue={initialData?.comments || ""}
              placeholder="Add any notes about this cron job..."
              className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 rounded-md px-3 py-2"
            />
          </div>
        </>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {!selectedProject && !isEdit
          ? "Create Cron"
          : loading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Cron"
              : "Create Cron"}
      </Button>
    </form>
  );
}
