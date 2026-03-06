import axios from "axios";
import type { AuthResponse, Category, Note } from "@/types";
import { getToken, clearToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/signup/", { email, password });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login/", { email, password });
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories/");
  return data;
}

export async function getNotes(categoryId?: number): Promise<Note[]> {
  const params = categoryId ? { category: categoryId } : {};
  const { data } = await api.get("/notes/", { params });
  return data;
}

export async function createNote(categoryId: number): Promise<Note> {
  const { data } = await api.post("/notes/", { category_id: categoryId });
  return data;
}

export async function getNote(id: number): Promise<Note> {
  const { data } = await api.get(`/notes/${id}/`);
  return data;
}

export async function updateNote(
  id: number,
  payload: { title?: string; content?: string; category_id?: number }
): Promise<Note> {
  const { data } = await api.put(`/notes/${id}/`, payload);
  return data;
}

export async function deleteNote(id: number): Promise<void> {
  await api.delete(`/notes/${id}/`);
}
