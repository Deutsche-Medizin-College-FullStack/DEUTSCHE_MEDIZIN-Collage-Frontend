export interface Student {
  id: string
  fullName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  address: string
  department: string
  program: string
  batch: string
  year: string
  studentId: string
  enrollmentDate: string
  expectedGraduation: string
  academicAdvisor: string
  gpa: number
  totalCredits: number
  completionRate: number
  avatar?: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email: string
  }
  previousEducation: string
}

export const mockStudent: Student = {
  id: "STU001",
  fullName: "አበበ ከበደ",
  firstName: "አበበ",
  lastName: "ከበደ",
  email: "abebe.kebede@dhmc-college.de",
  phone: "+49 123 456 7890",
  dateOfBirth: "1998-05-15",
  nationality: "Ethiopian",
  address: "Musterstraße 123, 10115 Berlin, Germany",
  department: "Medicine",
  program: "Medicine (MD)",
  batch: "2023",
  year: "Year 1",
  studentId: "2024001",
  enrollmentDate: "2023-09-01",
  expectedGraduation: "2029-07-31",
  academicAdvisor: "Dr. Mueller",
  gpa: 1.4,
  totalCredits: 45,
  completionRate: 25,
  avatar: "/placeholder.svg?height=128&width=128",
  emergencyContact: {
    name: "ማርታ ከበደ",
    relationship: "Mother",
    phone: "+49 123 456 7891",
    email: "marta.kebede@email.com",
  },
  previousEducation: "Addis Ababa University Preparatory School, Grade 12 (2023) - Grade: 3.8",
}
