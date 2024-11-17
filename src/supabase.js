import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jgxwqmnweoheuvrqufba.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneHdxbW53ZW9oZXV2cnF1ZmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNDY4MzIsImV4cCI6MjA0NjgyMjgzMn0.s29hd55FxrTu6Itq3tB93YTYbKOd9C6B5BXCrIy3xxw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
