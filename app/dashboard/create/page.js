"use client";

import { useEffect, useState } from "react";

import { CodeGenerator } from "@/lib/code-utils";
import { optionsData, platforms } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createRef, getProjects } from "@/app/actions/projects";

export default function CreatePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [platform, setPlatform] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [option, setOption] = useState("");
  const [details, setDetails] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  function resetForm() {
    setSelectedProject("");
    setPlatform("");
    setCustomPlatform("");
    setOption("");
    setDetails("");
    setGeneratedUrl("");
  }

  async function handleGenerate() {
    const selectedProjectData = projects.find(
      (p) => p.name === selectedProject
    );
    if (!selectedProjectData) return;

    const finalPlatform = platform === "Other" ? customPlatform : platform;
    const encodedDetails = btoa(details); // Use btoa instead of Buffer
    const code = CodeGenerator(finalPlatform, option);
    const urlValue = `${selectedProjectData.url}/?ref=${code}${encodedDetails}`;
    setGeneratedUrl(urlValue);

    // Save to database
    const refValue = urlValue.split("?ref=")[1];
    await createRef({
      projectName: selectedProject,
      val: refValue,
    });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedUrl);
    alert("URL copied to clipboard!");
  }

  const availableOptions = platform ? optionsData[platform] || [] : [];

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6 text-white">Create Ref</h1>

      {generatedUrl && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex">
          <Input
            id="generated-url"
            value={generatedUrl}
            readOnly
            className="bg-gray-800 border-gray-600 text-white cursor-pointer"
            onClick={copyToClipboard}
          />
        </div>
      )}

      <form className="gap-y-8 grid grid-cols-[100px_1fr] items-center">
        {/* Project Selection */}
        <Label htmlFor="project" className="text-gray-200 font-medium">
          Project Name
        </Label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-50">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.name}
                className="hover:bg-gray-700"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Platform Selection */}
        <Label htmlFor="platform" className="text-gray-200 font-medium">
          Platform
        </Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-50">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            {platforms.map((p) => (
              <SelectItem key={p} value={p} className="hover:bg-gray-700">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Platform Input */}
        {platform === "Other" && (
          <>
            <Label
              htmlFor="custom-platform"
              className="text-gray-200 font-medium"
            >
              Custom Platform
            </Label>
            <Input
              id="custom-platform"
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              placeholder="Enter custom platform name"
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </>
        )}

        {/* Option Selection */}
        {platform && (
          <>
            <Label htmlFor="option" className="text-gray-200 font-medium">
              Option
            </Label>
            <Select value={option} onValueChange={setOption}>
              <SelectTrigger className="bg-gray-800 w-50 border-gray-700 text-white">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {availableOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="hover:bg-gray-700"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* Details Input */}
        <Label htmlFor="details" className="text-gray-200 font-medium">
          Details
        </Label>
        <Input
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Enter details"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
        />

        {/* Generate Button */}
        <div className="flex gap-2 col-span-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedProject || !platform || !option || !details}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="border-gray-600 hover:bg-gray-700 text-white"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
