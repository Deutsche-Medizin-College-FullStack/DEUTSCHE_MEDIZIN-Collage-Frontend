// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Link } from "react-router-dom";
// import { UserPlus } from "lucide-react";
// import { useMemo, useState } from "react";

// type Teacher = {
//   id: string;
//   name: string;
//   qualification: string;
//   courses: number;
// };

// const MOCK_TEACHERS: Teacher[] = [
//   { id: "T-100", name: "Dr. Alemu", qualification: "PhD Biology", courses: 3 },
//   { id: "T-101", name: "Dr. Sara", qualification: "PhD Chemistry", courses: 4 },
//   { id: "T-102", name: "Mr. Bekele", qualification: "MSc Physics", courses: 2 },
// ];

// export default function HeadTeachers() {
//   const [query, setQuery] = useState("");
//   const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

//   const filtered = useMemo(() => {
//     return MOCK_TEACHERS.filter(
//       (t) =>
//         t.name.toLowerCase().includes(query.toLowerCase()) ||
//         t.id.toLowerCase().includes(query.toLowerCase())
//     );
//   }, [query]);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Department Teachers</h1>
//         <Link to="/head/create-teacher">
//           <Button className="flex items-center gap-2">
//             <UserPlus className="h-4 w-4" />
//             Create Teacher
//           </Button>
//         </Link>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Teacher Management</CardTitle>
//           <CardDescription>
//             View teacher profiles and assigned courses
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Search only */}
//           <Input
//             placeholder="Search by name or ID"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="text-left border-b">
//                   <th className="py-3 pr-4">ID</th>
//                   <th className="py-3 pr-4">Name</th>
//                   <th className="py-3 pr-4">Qualification</th>
//                   <th className="py-3 pr-4">Courses</th>
//                   <th className="py-3 pr-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((teacher) => (
//                   <tr key={teacher.id} className="border-b">
//                     <td className="py-3 pr-4">{teacher.id}</td>
//                     <td className="py-3 pr-4 font-medium">{teacher.name}</td>
//                     <td className="py-3 pr-4">{teacher.qualification}</td>
//                     <td className="py-3 pr-4">{teacher.courses}</td>
//                     <td className="py-3 pr-4">
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => setSelectedTeacher(teacher)}
//                           >
//                             Profile
//                           </Button>
//                         </DialogTrigger>

//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Teacher Profile</DialogTitle>
//                           </DialogHeader>

//                           {selectedTeacher && (
//                             <div className="space-y-4 py-4">
//                               <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                   <p className="text-sm text-muted-foreground">
//                                     ID
//                                   </p>
//                                   <p className="font-medium">
//                                     {selectedTeacher.id}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <p className="text-sm text-muted-foreground">
//                                     Name
//                                   </p>
//                                   <p className="font-medium">
//                                     {selectedTeacher.name}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <p className="text-sm text-muted-foreground">
//                                     Qualification
//                                   </p>
//                                   <p className="font-medium">
//                                     {selectedTeacher.qualification}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <p className="text-sm text-muted-foreground">
//                                     Courses Assigned
//                                   </p>
//                                   <p className="font-medium">
//                                     {selectedTeacher.courses}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                         </DialogContent>
//                       </Dialog>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Phone, Calendar, Briefcase } from "lucide-react";

type Teacher = {
  id: string;
  username: string;
  firstNameAmharic: string;
  lastNameAmharic: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  email: string;
  phoneNumber: string;
  departmentName: string;
  title: string;
  hireDateGC: string;
  yearsOfExperience: number;
  coursesAssigned: number;
  photographBase64?: string;
};

const MOCK_TEACHERS: Teacher[] = [
  {
    id: "42",
    username: "abebe2025",
    firstNameAmharic: "አበበ",
    lastNameAmharic: "በቀለ",
    firstNameEnglish: "Abebe",
    lastNameEnglish: "Bekele",
    email: "abebe.bekele@university.edu.et",
    phoneNumber: "0923456789",
    departmentName: "Computer Science",
    title: "Associate Professor",
    hireDateGC: "2010-09-01",
    yearsOfExperience: 15,
    coursesAssigned: 4,
  },
  {
    id: "43",
    username: "kebede2024",
    firstNameAmharic: "ከበደ",
    lastNameAmharic: "አለሙ",
    firstNameEnglish: "Kebede",
    lastNameEnglish: "Alemu",
    email: "kebede.alemu@university.edu.et",
    phoneNumber: "0911123456",
    departmentName: "Medicine",
    title: "Lecturer",
    hireDateGC: "2018-02-15",
    yearsOfExperience: 7,
    coursesAssigned: 3,
  },
  {
    id: "44",
    username: "sara2023",
    firstNameAmharic: "ሳራ",
    lastNameAmharic: "ተስፋዬ",
    firstNameEnglish: "Sara",
    lastNameEnglish: "Tesfaye",
    email: "sara.tesfaye@university.edu.et",
    phoneNumber: "0934567890",
    departmentName: "Nursing",
    title: "Assistant Professor",
    hireDateGC: "2015-10-01",
    yearsOfExperience: 10,
    coursesAssigned: 5,
  },
  {
    id: "45",
    username: "dawit2022",
    firstNameAmharic: "ዳዊት",
    lastNameAmharic: "ገብረመድህን",
    firstNameEnglish: "Dawit",
    lastNameEnglish: "Gebremedhin",
    email: "dawit.g@university.edu.et",
    phoneNumber: "0945678901",
    departmentName: "Public Health",
    title: "Senior Lecturer",
    hireDateGC: "2012-08-20",
    yearsOfExperience: 13,
    coursesAssigned: 2,
  },
];

export default function HeadTeachers() {
  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filtered = useMemo(() => {
    return MOCK_TEACHERS.filter(
      (t) =>
        t.id.includes(query) ||
        t.firstNameEnglish.toLowerCase().includes(query.toLowerCase()) ||
        t.lastNameEnglish.toLowerCase().includes(query.toLowerCase()) ||
        t.firstNameAmharic.includes(query) ||
        t.lastNameAmharic.includes(query) ||
        t.email.toLowerCase().includes(query.toLowerCase()) ||
        t.departmentName.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Department Teachers</h1>
        <Link to="/head/create-teacher">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create Teacher
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Management</CardTitle>
          <CardDescription>
            View and manage all teachers in your department
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <Input
            placeholder="Search by ID, name (English/Amharic), email, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md"
          />

          {/* Teachers Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 pr-6">Photo</th>
                  <th className="py-3 pr-6">Teacher ID</th>
                  <th className="py-3 pr-6">Name</th>
                  <th className="py-3 pr-6">Department</th>
                  <th className="py-3 pr-6">Title</th>
                  <th className="py-3 pr-6">Courses</th>
                  <th className="py-3 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 pr-6">
                      <Avatar>
                        <AvatarImage
                          src={teacher.photographBase64 || undefined}
                        />
                        <AvatarFallback className="bg-primary/10">
                          {teacher.firstNameEnglish[0]}
                          {teacher.lastNameEnglish[0]}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="py-4 pr-6 font-mono text-muted-foreground">
                      {teacher.id}
                    </td>
                    <td className="py-4 pr-6">
                      <div>
                        <div className="font-medium">
                          {teacher.firstNameEnglish} {teacher.lastNameEnglish}
                        </div>
                        <div className="text-sm text-muted-foreground font-geez">
                          {teacher.firstNameAmharic} {teacher.lastNameAmharic}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6">
                      <Badge variant="secondary">
                        {teacher.departmentName}
                      </Badge>
                    </td>
                    <td className="py-4 pr-6">{teacher.title}</td>
                    <td className="py-4 pr-6 text-center">
                      <Badge variant="outline">{teacher.coursesAssigned}</Badge>
                    </td>
                    <td className="py-4 pr-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTeacher(teacher)}
                          >
                            View Profile
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">
                              Teacher Profile
                            </DialogTitle>
                          </DialogHeader>

                          {selectedTeacher && (
                            <div className="space-y-6 py-6">
                              <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                  <AvatarImage
                                    src={
                                      selectedTeacher.photographBase64 ||
                                      undefined
                                    }
                                  />
                                  <AvatarFallback className="text-2xl">
                                    {selectedTeacher.firstNameEnglish[0]}
                                    {selectedTeacher.lastNameEnglish[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">
                                    {selectedTeacher.firstNameEnglish}{" "}
                                    {selectedTeacher.lastNameEnglish}
                                  </h3>
                                  <p className="text-lg font-geez text-primary">
                                    {selectedTeacher.firstNameAmharic}{" "}
                                    {selectedTeacher.lastNameAmharic}
                                  </p>
                                  <p className="text-muted-foreground">
                                    ID: {selectedTeacher.id}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Academic Title
                                      </p>
                                      <p className="font-medium">
                                        {selectedTeacher.title}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Badge className="w-fit">
                                      {selectedTeacher.departmentName}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Hire Date (GC)
                                      </p>
                                      <p className="font-medium">
                                        {new Date(
                                          selectedTeacher.hireDateGC
                                        ).toLocaleDateString("en-GB")}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Experience
                                    </p>
                                    <p className="font-medium">
                                      {selectedTeacher.yearsOfExperience} years
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Email
                                      </p>
                                      <p className="font-medium">
                                        {selectedTeacher.email}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Phone
                                      </p>
                                      <p className="font-medium">
                                        {selectedTeacher.phoneNumber}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Courses Assigned
                                    </p>
                                    <p className="font-medium text-lg">
                                      {selectedTeacher.coursesAssigned}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx global>{`
        .font-geez {
          font-family: "Nyala", "Abyssinica SIL", sans-serif;
        }
      `}</style>
    </div>
  );
}
