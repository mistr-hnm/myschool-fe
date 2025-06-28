
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