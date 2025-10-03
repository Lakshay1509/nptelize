import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import type { Student, Subject } from '../../types/faculty/MannualVerification';
import TableSkeleton from '../ui/TableSkeleton';
import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import RequestDetailsDropdown from './RequestDetailsDropdown';
import { TenureSelector } from '../ui/DropDown';


type Response = {
    id: string,
    student: Student,
    subject: Subject,
    verified_total_marks: string,
    created_at : string,
    due_date : string
}

type ApiResponse = {
    requests: Response[]

}

const fetchData = async (year: number, sem: number) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const reqType = {
        request_types: ["rejected"],
    };

    const { data } = await axios.post<ApiResponse>(
        `${apiUrl}/teacher/subject/requests`,
        reqType,
        {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
            params: { year, sem },
        }
    );
    return data;
};

const MannualVerification = () => {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const { tenure } = useAuthStore();
    const year = tenure?.year;
    const sem = tenure?.is_odd;

    const {
        data: apiData,
        error,
        isLoading,
        isFetching
    } = useQuery({
        queryKey: ["teacherRequestsByStatus", year, sem],
        queryFn: () => fetchData(year as number, sem as number),
        refetchOnWindowFocus: false,
    });

    const headings = ["Name", "Email", "Roll No.", "Subject Name", "Subject Code", "Actions"]



    if (error) return <div>Error loading data</div>;

    return (
        <>
            <div className='px-4 py-8'>
                <h1 className="text-center text-2xl font-semibold text-gray-800 mb-10 tracking-wider">
                    Verify Rejected Manually
                </h1>
                <div className="flex justify-center md:justify-end mb-6 max-w-7xl mx-auto">
                              <TenureSelector />
                </div>

                {apiData && (
                <h1 className="text-center text-lg font-semibold text-gray-800 mb-8 tracking-wider max-w-7xl mx-auto md:text-left">
                    Total Rejected Requests :  {apiData?.requests.length >0 ? apiData?.requests.length : 0}
                </h1>)}

                <div className='max-w-7xl mx-auto'>
                    {isLoading || isFetching ? (
                        <TableSkeleton rows={5} cols={7} className="max-w-7xl mx-auto" />
                    ) : (
                        <div className="overflow-x-scroll rounded-lg shadow-sm border border-gray-100 bg-white">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-sm font-medium text-gray-700">
                                        {headings.map((heading, idx) => (
                                            <th key={idx} className="px-6 py-4 text-left">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {apiData?.requests && apiData.requests.length > 0 ? (
                                        apiData.requests.map((request) => (
                                            <>
                                            <tr key={request.id} className="text-sm text-gray-700 hover:bg-gray-50">
                                                <td className="px-6 py-4">{request.student.name}</td>
                                                <td className="px-6 py-4">{request.student.email}</td>
                                                <td className="px-6 py-4">{request.student.roll_number}</td>
                                                <td className="px-6 py-4">{request.subject.name}</td>
                                                <td className="px-6 py-4">{request.subject.subject_code}</td>
                                                <td className="px-6 py-4">

                                                    <button
                                                        onClick={() => setOpenDropdownId(openDropdownId === request.id ? null : request.id)}
                                                        className="shadow-md px-5 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-black hover:text-white hover:cursor-pointer"
                                                    >
                                                        <FaChevronRight
                                                            className={`w-4 h-4 transition-transform mx-auto ${openDropdownId === request.id ? 'rotate-90' : ''}`}
                                                        />
                                                    </button>

                                                </td>
                                            </tr>
                                            {openDropdownId === request.id && (
                                <RequestDetailsDropdown
                                  request={
                                    {
                                        id:request.id,
                                        student:request.student,
                                        subject:request.subject,
                                        status : "rejected",
                                        verified_total_marks:request.verified_total_marks,
                                        created_at: request.created_at,
                                        due_date: request.due_date,
                                        
                                        
                                    }
                                  }
                                  colSpan={headings.length}
                                  subjectId={request.subject.id}
                                  onClose={() => setOpenDropdownId(null)}
                                  showReject={false}
                                />
                              )}
                                            </>
                                            
                                            
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                No rejected requests to verify
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>

    )
}

export default MannualVerification