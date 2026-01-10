import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function HeadReports() {
  const [semester, setSemester] = useState("I")
  const [course, setCourse] = useState("")
  const [range, setRange] = useState({ from: "2025-09-01", to: "2025-12-31" })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Department Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reports</CardTitle>
          <CardDescription>Generate and export performance/attendance reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="border rounded px-3 py-2 bg-background" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="I">Semester I</option>
              <option value="II">Semester II</option>
            </select>
            <Input placeholder="Filter by course code/name" value={course} onChange={(e) => setCourse(e.target.value)} />
            <Input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
            <Input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Generate Performance Report</Button>
            <Button variant="outline">Generate Attendance Report</Button>
            <Button variant="outline">Export PDF</Button>
            <Button variant="outline">Export Excel</Button>
          </div>

          <div className="border rounded p-4 text-sm text-muted-foreground">
            Reports preview will appear here based on filters. Compare semesters by switching the semester selector above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
