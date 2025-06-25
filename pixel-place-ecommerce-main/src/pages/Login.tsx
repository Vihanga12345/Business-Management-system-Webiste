
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Try test@example.com / password123",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Form */}
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-cyan-500 mb-6">LOGIN</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 font-bold"
                >
                  {isLoading ? 'Logging in...' : 'LOGIN'}
                </Button>

                <div className="text-center text-gray-400 mt-4">
                  <p className="text-sm">
                    Test credentials: test@example.com / password123
                  </p>
                </div>
              </form>
            </div>

            {/* New Customer */}
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-cyan-500 mb-6">NEW CUSTOMER</h2>
              
              <h3 className="text-lg font-bold text-white mb-4">CREATE A ACCOUNT</h3>
              
              <p className="text-gray-300 mb-6">
                Sign up for a free account at our store. Registration is quick and easy. 
                It allows you to be able to order from our shop. To start shopping click register.
              </p>

              <Link to="/register">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 font-bold">
                  CREATE AN ACCOUNT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
