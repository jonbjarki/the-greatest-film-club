"use client"

import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup } from "../ui/field"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { UserProfile } from "@/lib/schemas"
import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { updateProfileAction } from "@/app/actions/user"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const BIO_MIN = 20;
const BIO_MAX = 300;
const USERNAME_MIN = 4;

export default function EditProfileButton({ user }: { user: UserProfile }) {
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio);
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
    const [bioErrors, setBioErrors] = useState<string[]>([]);
    const [pending, setPending] = useState(false);
    const router = useRouter();
    const bioLength = (bio ?? "").length;

    const handleChange = (field: "username" | "bio", value: string) => {
        if (field === "username") {
            setUsername(value);
            setUsernameErrors(value.trim().length < USERNAME_MIN ? [`Username must be at least ${USERNAME_MIN} characters long`] : []);
        } else if (field === "bio") {
            setBio(value);
            const length = value.length;
            setBioErrors(
                length > 0 && length < BIO_MIN
                    ? [`Bio must be at least ${BIO_MIN} characters`]
                    : length > BIO_MAX
                        ? [`Bio must be at most ${BIO_MAX} characters`]
                        : []
            );
        }
    };

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        setPending(true);
        if (bioErrors.length > 0 || usernameErrors.length > 0) {
            setPending(false);
            return;
        }
        let profileImageUrl = imageUrl;

        // Only upload if the user selected a new image
        if (image) {
            try {
                const blob = await upload(
                    `profile-images/${crypto.randomUUID()}-${image.name}`,
                    image,
                    {
                        access: "public",
                        handleUploadUrl: "/api/avatar/upload",
                    },
                );
                if (blob) {
                    profileImageUrl = blob.url;
                    setImageUrl(blob.url);
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error("Failed to upload image, try again later");
            }
        }
        if (username == user.username && bio == user.bio && profileImageUrl == null) {
            setPending(false);
            return; // Dont make a request if nothing has changed
        }
        // Update user profile with the new data including the profile image URL
        const res = await updateProfileAction({
            bio: bio !== user.bio ? bio : undefined,
            image_url: profileImageUrl !== null ? profileImageUrl : undefined,
            username: username !== user.username ? username : undefined,
        })
        if ("errors" in res) {
            if (res.errors.username) {
                setUsernameErrors([res.errors.username]);
            }
            setPending(false);
            return;
        }
        toast.success("Profile updated successfully");
        if (user.username !== res.username) {
            router.replace(`/profile/${encodeURIComponent(res.username)}`);
        }
        setPending(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field data-invalid={usernameErrors.length > 0}>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username"
                                defaultValue={username}
                                aria-invalid={usernameErrors.length > 0}
                                onChange={(e) => handleChange("username", e.target.value)} />
                            {usernameErrors.length > 0 && (
                                usernameErrors.map((error, index) => (
                                    <FieldError key={index}>{error}</FieldError>
                                ))
                            )}
                        </Field>
                        <Field data-invalid={bioErrors.length > 0}>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={bio ?? ""}
                                placeholder="Say something about yourself"
                                className="resize-none"
                                aria-invalid={bioErrors.length > 0}
                                aria-describedby="bio-help"
                                onChange={(e) => handleChange("bio", e.target.value)}
                            />
                            <div id="bio-help" className="flex items-start justify-between gap-2 text-xs">
                                <span className={bioErrors.length > 0 ? "text-destructive" : "text-muted-foreground"}>
                                    {bioErrors.length > 0 ? bioErrors[0] : `${BIO_MIN}-${BIO_MAX} characters (optional)`}
                                </span>
                                <span className={bioErrors.length > 0 ? "text-destructive tabular-nums" : "text-muted-foreground tabular-nums"}>
                                    {bioLength}/{BIO_MAX}
                                </span>
                            </div>
                        </Field>
                        <Field>
                            <Label htmlFor="image">Profile Image </Label>
                            <FieldContent>
                                <Input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                                    setImage(e.target.files?.[0] ?? null)
                                }} />
                                <FieldDescription>Select a profile image to upload</FieldDescription>
                            </FieldContent>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={pending || usernameErrors.length > 0 || bioErrors.length > 0}>Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}