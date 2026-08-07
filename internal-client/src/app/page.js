"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/Auth.context";
import { useLoading } from "@/contexts/Loading.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { consumeLastPath } from "@/lib/lastPath";
import PageFadeIn from "@/components/PageFadeIn";

const loginSchema = Yup.object({
  password: Yup.string().trim().required("Password is required"),
});

const DEFAULT_POST_LOGIN = "/dashboard?tab=inbox";

function resolvePostLoginPath() {
  return consumeLastPath() ?? DEFAULT_POST_LOGIN;
}

export default function Home() {
  const router = useRouter();
  const { accessToken, setAccessToken, isReady } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isReady && accessToken) {
      // Single consume so login + already-authed paths do not race to dashboard.
      router.replace(resolvePostLoginPath());
    }
  }, [isReady, accessToken, router]);

  const formik = useFormik({
    initialValues: { password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(undefined);
      showLoading();

      try {
        const { data, error } = await fetchApi("/admin/login", {
          method: "POST",
          body: JSON.stringify({ password: values.password }),
        });

        if (error) {
          setStatus(error.message || "Login failed");
          return;
        }

        setAccessToken(data.token);
        // Redirect handled by the accessToken effect above.
      } finally {
        hideLoading();
        setSubmitting(false);
      }
    },
  });

  if (!isReady || accessToken) {
    return null;
  }

  return (
    <PageFadeIn className="flex flex-1 items-center justify-center p-6">
      <form
        onSubmit={formik.handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-xl font-semibold tracking-tight">Admin Login</h1>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formik.values.password}
            onValueChange={(value) => formik.setFieldValue("password", value)}
            onBlur={() => formik.setFieldTouched("password", true)}
            aria-invalid={
              formik.touched.password && formik.errors.password
                ? true
                : undefined
            }
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="text-sm text-destructive">{formik.errors.password}</p>
          ) : null}
        </div>

        {formik.status ? (
          <p className="text-sm text-destructive">{formik.status}</p>
        ) : null}

        <Button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </PageFadeIn>
  );
}
