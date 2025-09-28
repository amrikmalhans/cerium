"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { organization } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { createOrganizationSchema, type CreateOrganizationFormData } from "@cerium/types";
import { generateSlug } from "@/lib/utils";

export default function CreateOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const handleNameChange = (value: string) => {
    const generatedSlug = generateSlug(value);
    form.setValue("slug", generatedSlug);
  };

  const onSubmit = async (values: CreateOrganizationFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create organization");
      } else {
        await organization.setActive({
          organizationId: result.data.id,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Create organization error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Create Your Organization
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Set up your engineering team&apos;s knowledge base
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Acme Engineering"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      The name of your engineering team or company
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Slug</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="acme-engineering"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Skip for now
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            You can create multiple organizations and switch between them later.
          </p>
        </div>
      </div>
    </div>
  );
}
