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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createCouses, deleteCouses, getCourse, getCourses, updateCouses } from "@/service"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export function DataTableDemo() {

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [coursesData, setCoursesData] = useState([]); 
  
     
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const formSchema = z.object({
    _id : z.string().optional(),
    courseId : z.number(),
    name : z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues : {
      name : "",
      courseId : 0,
    }
  });

  useEffect(()=> {
    getcourses()
  },[]);

  const getcourses = ()=> {
    getCourses().then((data)=> {
      const courses = data.data;
      setCoursesData(courses);
    });
  }

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "courseId",
      header: "Course Id",    
      cell: ({ row }) => (
        <div className="capitalize ">{row.getValue("courseId")}</div>
      ),
    },
    {
      accessorKey: "name",
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
      cell: ({ row }) => <div >{row.getValue("name")}</div>
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
          <Button variant="outline" disabled={isLoading}  onClick={() => {
            onEdit(row.original);
          }}>
            Edit
          </Button>
          <Button variant="outline" className="mx-2" disabled={isLoading}  onClick={() => {
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
    data : coursesData,
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

  
  const onSubmit = async()=> {
    setIsLoading(true); // Set loading state to true
    try {
      const result = formSchema.safeParse({ ...form.getValues()});
      console.log("result==>",result);
      if(!result.success){
        console.log("validation failed");
        return
      }
      const payLoad = result.data;
      
      if(payLoad?._id){
        updateCouses(payLoad._id,payLoad).then((data)=>{
          console.log("data",data);
          getcourses();
        });
      }else{
        createCouses(payLoad).then((data)=>{
          console.log("data",data);
          getcourses();
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false); // Reset loading state
      setIsDialogOpen(false)
    }
  }

  const onEdit = async(raw : Course)=> {
    setIsDialogOpen(true)
    const course = await getCourse(raw._id)
    const { courseId, name, _id } = course.data as Course
    form.setValue('name',name);
    form.setValue('courseId', courseId);
    form.setValue('_id', _id);
    
  }
  const onDelete = async(raw : Course)=> {    
    setIsLoading(true); // Set loading state to true
    try {
      deleteCouses(raw._id).then((data)=>{
        console.log("data",data);
        getcourses();
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
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
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
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Id</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Course Id"
                          type="number"
                           {...field}
                            value={field.value || "" }
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")} // Convert to number
                            />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name"  {...field} value={field.value || "" } />
                      </FormControl> 
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
type Course = {
  _id: string
  courseId: number
  name: string
  createdAt: Date
  updatedAt: Date
} 