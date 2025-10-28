import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import Papa from 'papaparse';
import { TenureSelector } from '../ui/DropDown';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-toastify';

interface EnrollmentData {
  email: string;
  course_code: string;
}



type Student = {
  email:string;
  message : string;
  success : boolean;
}

type ApiResponse = {

  results: Student[];

}

const enrollApi = async (students : EnrollmentData[],year:number,sem:number) =>{

  const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post<ApiResponse>(`${apiUrl}/admin/enroll/students`, students, {
        withCredentials: true,
        params:{year,sem}
      });

      return response.data;

}

const EnrollStudents = () => {
  // const [email, setEmail] = useState('');
  // const [subjectCode, setSubjectCode] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [apiCalled, setApiCalled] = useState(false);
  const [successStudent, setSuccessStudent] = useState(0);
  const [errorStudents, setErrorStudents] = useState<Student[]>([]);

  const { tenure } = useAuthStore();
      const year = tenure?.year;
      const sem = tenure?.is_odd;

  const mutation = useMutation({
  mutationFn: (students: EnrollmentData[]) => enrollApi(students, year as number, sem as number),
  onSuccess: (data) => {
    setApiCalled(true);
    
    // Use local variables instead of immediate state updates
    let localSuccessCount = 0;
    const failedStudents:Student[] = [];

    // Process response data
    data.results.forEach((obj) => {
      if (obj.success === true) {
        localSuccessCount += 1;
      } else {
        failedStudents.push(obj);
      }
    });

    // Update state with final counts
    setSuccessStudent(localSuccessCount);
    setErrorStudents(failedStudents);

    // Use local variable for toast (this will work correctly)
    if (localSuccessCount > 0) {
      toast.success(`Successfully enrolled ${localSuccessCount} students`);
    }
  },
  onError: () => {
    toast.error("Failed to enroll students");
  }
});

  // const handleSingleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!email || !subjectCode) {
  //     setError('Please fill all required fields');
  //     return;
  //   }

  //   const data: EnrollmentData[] = [
  //     {
  //       email,
  //       subject_code: subjectCode,
  //     },
  //   ];

  //   setError(null);
  //   mutation.mutate(data);
  // };



  const handleCSVUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

Papa.parse<EnrollmentData>(csvFile, {
  header: true,
  skipEmptyLines: true,
  complete: (result) => {
    const { data, errors, meta } = result;

    if (errors.length > 0) {
      toast.error(`Error parsing CSV: ${errors[0].message}`);
      return;
    }

    const headers = (meta.fields || []).map(field => field.trim().toLowerCase());
    const requiredHeaders = ['email', 'course_code'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
      toast.error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
      return;
    }

    if (data.length === 0) {
      toast.error('CSV file has no data rows');
      return;
    }

    // Normalize emails to lowercase
    const normalizedData = data.map(student => ({
      ...student,
      email: student.email.trim().toLowerCase(),
    }));

    mutation.mutate(normalizedData);
  },
  error: (error) => {
    toast.error(`Error reading the CSV file: ${error.message}`);
  }
});
  };

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">Enroll Students in Subjects</h2>

      <div className="flex justify-center md:justify-start mb-6 max-w-7xl mx-auto">
        <TenureSelector />
      </div>

      {apiCalled && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Enrolled Students: </strong>
          <span className="block sm:inline">{successStudent}</span>
        </div>
      )}

      {mutation.isPending && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Processing...</span>
        </div>
      )}

      {errorStudents.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-medium mb-4 text-red-600">Failed Enrollments ({errorStudents.length})</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 ">
                {errorStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {student.message}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Single Enrollment</h3>
          <form onSubmit={handleSingleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Student Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subjectCode" className="block text-gray-700 font-medium mb-2">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subjectCode"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. CS101"
                required              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              Enroll Student
            </button>
          </form>
        </div> */}

        {/* CSV Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Bulk Enrollment via CSV</h3>
          <form onSubmit={handleCSVUpload}>
            <div className="mb-4">
              <label htmlFor="csvFile" className="block text-gray-700 font-medium mb-2">
                CSV File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"                required
              />
              <p className="mt-1 text-sm text-gray-500">
                CSV must include headers: email, course_code(NSUT code).
              </p>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !csvFile}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              Upload & Process
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudents;
