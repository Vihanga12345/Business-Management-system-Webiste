import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerFirstName || !registerLastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        firstName: registerFirstName,
        lastName: registerLastName,
        phone: registerPhone,
        address: registerAddress,
      });
      toast({
        title: "Registration successful!",
        description: "Welcome to GEOLEX!",
      });
      onClose();
      if (onAuthSuccess) onAuthSuccess();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again or use a different email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            Sign in to add items to cart
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-cyan-500">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-white data-[state=active]:bg-cyan-500">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-white">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="text-white">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 font-bold"
              >
                {isLoading ? 'Logging in...' : 'LOGIN'}
              </Button>
            </form>

            <div className="text-center text-gray-400">
              <p className="text-sm">
                Test credentials: test@example.com / password123
              </p>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="register-firstname" className="text-white">First Name</Label>
                  <Input
                    id="register-firstname"
                    type="text"
                    placeholder="First name"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-lastname" className="text-white">Last Name</Label>
                  <Input
                    id="register-lastname"
                    type="text"
                    placeholder="Last name"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="register-email" className="text-white">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="register-password" className="text-white">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="register-phone" className="text-white">Phone (Optional)</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="Phone number"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="register-address" className="text-white">Address (Optional)</Label>
                <Input
                  id="register-address"
                  type="text"
                  placeholder="Your address"
                  value={registerAddress}
                  onChange={(e) => setRegisterAddress(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 font-bold"
              >
                {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog; 