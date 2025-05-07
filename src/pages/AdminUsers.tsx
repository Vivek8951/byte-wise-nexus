
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserRow } from "@/components/admin/UserRow";
import { UserDetails } from "@/components/admin/UserDetails";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Search,
  Users,
  Book,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role !== 'admin') {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
    } else if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, user, navigate, toast]);

  // Fetch all users
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          // Get enrolled courses for each user
          const usersWithEnrollments = await Promise.all(
            profiles.map(async (profile) => {
              const { data: enrollments } = await supabase
                .from('course_enrollments')
                .select('course_id')
                .eq('user_id', profile.id);
                
              return {
                ...profile,
                enrolledCourses: enrollments?.map(e => e.course_id) || []
              } as User;
            })
          );

          setUsers(usersWithEnrollments);
        } catch (error: any) {
          console.error("Error fetching users:", error);
          toast({
            title: "Error",
            description: "Failed to load users",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [user?.role, toast]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-blue"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold heading-gradient">User Management</h1>
            <p className="text-muted-foreground">Manage users, enrollments, and progress</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <UserRow 
                          key={user.id} 
                          user={user}
                          onSelect={() => setSelectedUser(user)}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedUser && (
          <UserDetails 
            userId={selectedUser.id} 
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
