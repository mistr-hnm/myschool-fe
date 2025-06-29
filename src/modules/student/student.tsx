import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type ColumnDef
} from "@tanstack/react-table"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"

import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getStudents, createStudent, deleteStudent, updateStudent, getCourses } from "@/service"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function StudentTable() {

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [courseData, setCourseData] = useState([]);


  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const formSchema = z.object({
    _id: z.string().optional(),
    enrollmentNumber: z.number(),
    fullname: z.string(),
    dateofbirth: z.date(),
    enrollmentCourse: z.string(),
    picture: z.any(),
    description: z.string().optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentNumber: 0,
      fullname: "",
      dateofbirth: new Date(),
      enrollmentCourse: "",
      description: "",
    }
  });

  useEffect(() => {
    getCoursesList();
    getStudentsList();
  }, []);

  const getStudentsList = () => {
    getStudents().then((data) => {
      const students = data.data;
      console.log("students",students);
      setStudentData(students);
    });
  }


  const getCoursesList = () => {
    getCourses().then((data) => {
      const courses = data.data;
      setCourseData(courses);
    });
  }
  

  const columns: ColumnDef<Student>[] = [
    {
     id: "picture",
     enableHiding : true,
      cell: ({ row }) => {
        const imageBase64 = row.original.picture;
        return  <>
        <div className="flex justify-center">
            <Avatar className="">
            <AvatarImage src={`${imageBase64}`}/>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
        </>
      }
    },
    {
      accessorKey: "enrollmentNumber",
      header: "Enrollment Number",
      cell: ({ row }) => (
        <>
          <div className="capitalize ">{row.getValue("enrollmentNumber")}</div>
        </>
      ),
    },
    {
      accessorKey: "fullname",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
          </Button>
        )
      },
      cell: ({ row }) => <div >{row.getValue("fullname")}</div>
    },
    {
      accessorKey: "enrollmentCourse",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Course
          </Button>
        )
      },
      cell: ({ row }) => {
        const enrollmentCourse: any = row.getValue("enrollmentCourse")
        return <div>{enrollmentCourse?.name}</div>
      }
    },
    {
      accessorKey: "dateofbirth",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            DOB
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("dateofbirth"))
        const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
        return <div className="font-medium">{formattedDate}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Added on</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
        return <div className="text-right font-medium">{formattedDate}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end ">
            <Button variant="outline" disabled={isLoading} onClick={() => {
              onEdit(row.original);
            }}>
              Edit
            </Button>
            <Button variant="outline" className="mx-2" disabled={isLoading} onClick={() => {
              onDelete(row.original);
            }}>
              Delete
            </Button>
          </div>
        )
      },
    }
  ]

  const table = useReactTable({
    data: studentData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleImageChange = (event : any) => {
    const file = event.target.files?.[0]
    if(file){
      const reader = new FileReader()
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        form.setValue('picture', reader.result as string);
      }
    }
  }


  const onSubmit = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const model = { ...form.getValues() }    
      console.log("model",model);
      model["dateofbirth"] = new Date(model.dateofbirth) 
      const result = formSchema.safeParse({ ...model })
      if (!result.success) {
        console.log("validation failed");
        return
      }
      
      const payLoad = result.data; 
      if (payLoad?._id) {
        updateStudent(payLoad._id, payLoad).then((data) => {
          console.log("data", data);
          getStudentsList();
        });
      } else {
        createStudent(payLoad).then((data) => {
          console.log("data", data);
          getStudentsList();
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false); // Reset loading state
      setIsDialogOpen(false)
    }
  }

  const onEdit = async (student: any) => {
    setIsDialogOpen(true);
    const { _id, enrollmentNumber, fullname, dateofbirth, enrollmentCourse, } = student;
    form.setValue('enrollmentNumber', enrollmentNumber);
    form.setValue('fullname', fullname);
    form.setValue('_id', _id);
    form.setValue('dateofbirth', dateofbirth);
    form.setValue('enrollmentCourse', enrollmentCourse?._id);
  }

  const onDelete = async (raw: Student) => {
    setIsLoading(true); // Set loading state to true
    try {
      deleteStudent(raw._id).then((data) => {
        console.log("data", data);
        getStudentsList();
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false); // Reset loading state
      setIsDialogOpen(false)
    }
  }


  return (
    <div className="w-full">
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex justify-end mb-2">
          <AlertDialogTrigger asChild className="">
            <Button variant="outline" onClick={() => 
              {
                setIsDialogOpen(true);
                form.reset();
              }
              }>
              New
            </Button>
          </AlertDialogTrigger>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Student form</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Please fill out the form below to continue.
          </AlertDialogDescription>
          <div className="text-muted-foreground text-sm">
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                onSubmit();
              }}
                className="space-y-8">
                <FormField
                  control={form.control}
                  name="enrollmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enrollment number"
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")} // Convert to number
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fullname</FormLabel>
                      <FormControl>
                        <Input placeholder="Name"  {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                  name="picture"
                  render={({ field : { value, onChange, ...fieldProps }}) => (
                    <FormItem>
                      <FormLabel>Picture</FormLabel>
                      <FormControl>
                        <Input
                         {...fieldProps}
                         type="file" 
                         accept="image/*"
                         onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="dateofbirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOB</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild className="w-full">
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left shadow-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Calendar
                            mode="single"
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Your date of birth is used to calculate your age.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enrollmentCourse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {
                            courseData.map((course: any) => {
                              return <SelectItem key={course._id} value={course._id}>{course?.name}</SelectItem>
                            })
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading} // Disable button while loading
                  >
                    {isLoading ? "Loading..." : "Continue"}
                  </Button>

                </AlertDialogFooter>
              </form>
            </Form>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export type Student = {
  _id: string
  enrollmentNumber: number
  fullname: string
  dateofbirth: Date
  enrollmentCourse: string  
  picture: string
  description: string
  status?: string
  createdAt: Date
  updatedAt: Date
} 