import { useEffect, useState } from "react";
import Error from "./error";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { BeatLoader } from "react-spinners";

import * as Yup from "yup";
import useFetch from "@/hooks/user-fetch";

import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/context";
import { signup } from "@/db/apiAuth";

const SignUp = () => {
  const [formDate, setFormDate] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const [errors, setErrors] = useState([]);

  const navigator = useNavigate();

  let [searchParam] = useSearchParams();
  const longLink = searchParam.get("createNew");

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormDate((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const { data, error, loading, fn: fnSignup } = useFetch(signup, formDate);

  const { fetchUser } = UrlState();

  useEffect(() => {
    if (error === null && data) {
      navigator(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
      fetchUser();
    }
  }, [error, loading]);

  const handleSignup = async () => {
    setErrors([]);
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("name is required"),
        email: Yup.string()
          .email("Invalid Email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().required("Profile Pic is required"),
      });
      await schema.validate(formDate, { abortEarly: false });
      await fnSignup();
    } catch (e) {
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>SignUp</CardTitle>
          <CardDescription>
            create a new account if ypu haven&rsquo;t already
          </CardDescription>
          {error && <Error message={error.message} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="name"
              type="text"
              placeholder="Enter your name"
              onChange={handleInputChange}
            />
            {errors.name && <Error message={errors.name} />}
          </div>
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleInputChange}
            />
            {errors.email && <Error message={errors.email} />}
          </div>
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleInputChange}
            />
            {errors.password && <Error message={errors.password} />}
          </div>
          <div className="space-y-1">
            <Input
              name="profile_pic"
              type="file"
              accept="Image/*"
              onChange={handleInputChange}
            />
            {errors.profile_pic && <Error message={errors.profile_pic} />}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignup}>
            {loading ? (
              <BeatLoader size={10} color="#36d7b7" />
            ) : (
              "Create account"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
