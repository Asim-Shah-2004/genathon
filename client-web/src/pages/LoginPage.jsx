import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';

import backgroundImage from '@/assets/background.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard")
    console.log('Sign in attempted with:', email, password);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div
        className="w-full md:w-2/3 bg-cover bg-center p-8 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImage})` }} // Set the background image
      >
      </div>
      <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center mb-6"
            >
              Sign in
            </motion.h1>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-md"
                />
              </div>
              <Button type="submit" className="w-64 self-center bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2">
                Sign In
              </Button>
            </motion.form>
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </a>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
