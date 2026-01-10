"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const departments = [
  "Medicine",
  "Pharmacy",
  "Radiology",
  "Nursing",
  "Dentistry",
] as const;
const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] as const;

const gradeDataMock = Array.from({ length: departments.length }, (_, d) =>
  Array.from({ length: semesters.length }, (_, s) => ({
    dept: departments[d],
    semester: semesters[s],
    averages: { A: 32, B: 40, C: 18, D: 7, F: 3 },
    avgGpa: 3 + Math.random() * 0.5,
  }))
).flat();

type Dept = (typeof departments)[number];
type Sem = (typeof semesters)[number];

export default function DeanGrades() {
  const [selectedDept, setSelectedDept] = useState<Dept | "All">("All");
  const [selectedSem, setSelectedSem] = useState<Sem | "All">("All");

  const filtered = useMemo(() => {
    return gradeDataMock.filter(
      (r) =>
        (selectedDept === "All" || r.dept === selectedDept) &&
        (selectedSem === "All" || r.semester === selectedSem)
    );
  }, [selectedDept, selectedSem]);

  const totals = useMemo(() => {
    const sum = { A: 0, B: 0, C: 0, D: 0, F: 0 } as Record<string, number>;
    filtered.forEach((r) => {
      Object.entries(r.averages).forEach(([k, v]) => (sum[k] += v));
    });
    return sum;
  }, [filtered]);

  const riskStudents = [
    {
      id: 1,
      name: "Chris Green",
      gpa: 1.92,
      dept: "Dentistry",
      semester: "Sem 2",
    },
    {
      id: 2,
      name: "Dana Brooks",
      gpa: 1.88,
      dept: "Nursing",
      semester: "Sem 1",
    },
    {
      id: 3,
      name: "Eric Young",
      gpa: 1.84,
      dept: "Medicine",
      semester: "Sem 3",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          Academic Performance
        </h1>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Department
              </span>
              <select
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                value={selectedDept}
                onChange={(e) =>
                  setSelectedDept(e.target.value as Dept | "All")
                }
              >
                <option>All</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Semester
              </span>
              <select
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value as Sem | "All")}
              >
                <option>All</option>
                {semesters.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              >
                Reset
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow lg:col-span-2">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Average GPA by Course/Dept/Semester
              </h3>
              <Bar
                data={{
                  labels: filtered.map((r) => `${r.dept} • ${r.semester}`),
                  datasets: [
                    {
                      label: "Average GPA",
                      data: filtered.map((r) => Number(r.avgGpa.toFixed(2))),
                      backgroundColor: "#3B82F6",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Grade Distribution
              </h3>
              <Pie
                data={{
                  labels: Object.keys(totals),
                  datasets: [
                    {
                      data: Object.values(totals),
                      backgroundColor: [
                        "#16A34A",
                        "#3B82F6",
                        "#F59E0B",
                        "#EF4444",
                        "#6B7280",
                      ],
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
