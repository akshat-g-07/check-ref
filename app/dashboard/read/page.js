"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";

import { CodeDeGenerator } from "@/lib/code-utils";
import formatDateTime from "@/lib/date";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getRefs } from "@/app/actions/projects";

export default function ReadPage() {
  const [refs, setRefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadRefs();
  }, []);

  async function loadRefs() {
    const data = await getRefs();
    console.log(data);
    setRefs(data);
  }

  function decodeRef(refValue) {
    try {
      if (refValue.length < 11) return null;
      const codeDecrypt = {
        ...CodeDeGenerator(refValue.slice(0, 11)),
        name: atob(refValue.slice(11)), // Use atob instead of Buffer
      };

      return codeDecrypt;
    } catch (error) {
      return null;
    }
  }

  function formatVisitedAtArray(visitedAtArray) {
    if (
      !visitedAtArray ||
      !Array.isArray(visitedAtArray) ||
      visitedAtArray.length === 0
    ) {
      return "-";
    }

    // Sort dates in descending order (most recent first)
    const sortedDates = [...visitedAtArray]
      .map((date) => new Date(date))
      .filter((date) => !isNaN(date.getTime()))
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return "-";

    // Format all dates and join with ||
    const formattedDates = sortedDates.map((date) =>
      formatDateTime(date.toISOString())
    );
    return formattedDates.join(` \n `);
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  const filteredAndSortedRefs = refs
    .filter((ref) => {
      const tempSearchTerm = searchTerm.trim().split("ref=")[1] || searchTerm;

      return (
        ref.projectName.toLowerCase().includes(tempSearchTerm.toLowerCase()) ||
        ref.val.toLowerCase().includes(tempSearchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === "projectName") {
        aValue = a.projectName.toLowerCase();
        bValue = b.projectName.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6 text-white">Ref Data</h1>

      {/* Search and Sort Controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by project name or ref value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Refs Table */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-750">
              <TableHead
                className="cursor-pointer hover:bg-gray-700 text-gray-300"
                onClick={() => handleSort("projectName")}
              >
                <div className="flex items-center gap-2">
                  Project Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-300">Ref Value</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-700 text-gray-300"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-2">
                  Created At
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-gray-300">Platform</TableHead>
              <TableHead className="text-gray-300">Option</TableHead>
              <TableHead className="text-gray-300">Details</TableHead>
              <TableHead className="text-gray-300">Visited At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRefs.map((ref) => {
              const decoded = decodeRef(ref.val);
              return (
                <TableRow
                  key={ref.id}
                  className="border-gray-700 hover:bg-gray-750"
                >
                  <TableCell className="font-medium text-white">
                    {ref.projectName}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-300">
                    {ref.val}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDateTime(decoded?.date)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {decoded?.selectedPlatform || "Job"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {decoded?.selectedOption || "Referral"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {decoded?.name || "-"}
                  </TableCell>
                  <TableCell className="text-gray-300 whitespace-pre">
                    {formatVisitedAtArray(ref.visitedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredAndSortedRefs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No references found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
