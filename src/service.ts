
import axios from 'axios';

const url = "http://localhost:3000";

export const getCourses = async() =>{
   return await axios.get(`${url}/courses`);
}

export const createCouses = async (body: any) => {
   return await axios.post(`${url}/courses`, body);
}

export const getCourse = async (id: string) => {
   return await axios.get(`${url}/courses/` + id);
}

export const updateCouses = async (id: string,body: any) => {
   return await axios.put(`${url}/courses/${id}`, body);
}


export const deleteCouses = async (id: string) => {
   return await axios.delete(`${url}/courses/${id}`);
}


export const getStudents = async() =>{
   return await axios.get(`${url}/students`);
}

export const createStudent = async (body: any) => {
   return await axios.post(`${url}/students`, body);
}

export const getStudent = async (id: string) => {
   return await axios.get(`${url}/students/` + id);
}

export const updateStudent = async (id: string,body: any) => {
   return await axios.put(`${url}/students/${id}`, body);
}


export const deleteStudent = async (id: string) => {
   return await axios.delete(`${url}/students/${id}`);
}