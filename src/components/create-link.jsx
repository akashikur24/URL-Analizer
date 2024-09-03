import { UrlState } from "@/context";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Error from "./error";
import { Card } from "./ui/card";
import * as yup from "yup";
import useFetch from "@/hooks/user-fetch";
import { QRCode } from "react-qrcode-logo";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
const CreateLink = () => {
  const { user } = UrlState();

  const ref = useRef();

  const navigate = useNavigate();
  let [searchParam, setSearchParams] = useSearchParams();
  const longLink = searchParam.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
  });

  const schema = yup.object().shape({
    title: yup.string().required("title is required"),
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long url is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    console.log(e.target.id);
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };
  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, { ...formValues, user_id: user.id });

  useEffect(() => {
    if (error == null && data) {
      navigate(`/link/${data[0].id}`);
    }
  }, [error, data]);

  const createNewLink = async () => {
    setErrors([]);
    try {
      await schema.validate(formValues, { abortEarly: false });
      const canvas = ref.current.canvasRef.current;
      const blog = await new Promise((resolve) => canvas.toBlob(resolve));

      await fnCreateUrl(blog);
    } catch (error) {
      const newErrors = {};
      error?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <Dialog
      defaultOpen={longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>
        {formValues?.longUrl && (
          <QRCode value={formValues.longUrl} size={250} ref={ref} />
        )}
        <Input
          id="title"
          placeholder="Short's link title"
          value={formValues.title}
          onChange={handleChange}
        />
        {errors.title && <Error message={errors.title} />}

        <Input
          id="longUrl"
          placeholder="Enter your Long Url"
          value={formValues.longUrl}
          onChange={handleChange}
        />
        {errors.longUrl && <Error message={errors.longUrl} />}

        <div className="flex items-center gap-2">
          <Card className="p-2">trimmer.in</Card> /
          <Input
            id="customUrl"
            placeholder="Custom Link (optional)"
            value={formValues.customUrl}
            onChange={handleChange}
          />
        </div>
        {error && <Error message={error.message} />}

        <DialogFooter className="sm:justify-start">
          <Button
            disabled={loading}
            type="submit"
            variant="destructive"
            onClick={createNewLink}
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLink;
