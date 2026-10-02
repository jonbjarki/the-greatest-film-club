"use client"

import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Field, FieldContent, FieldDescription, FieldGroup } from "../ui/field"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { UserProfile } from "@/lib/schemas"
import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { updateProfileAction } from "@/app/actions/user"
import { redirect } from "next/navigation"

export default function EditProfileButton({ user }: { user: UserProfile }) {
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio ?? "");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        console.log('Submitting profile update with:', { username, bio, image, imageUrl });
        let profileImageUrl = imageUrl;

        // Only upload if the user selected a new image
        if (image) {
            const blob = await upload(
                `profile-images/${crypto.randomUUID()}-${image.name}`,
                image,
                {
                    access: "public",
                    handleUploadUrl: "/api/avatar/upload",
                },
            );

            profileImageUrl = blob.url;
            setImageUrl(blob.url);
        }

        // Update user profile with the new data including the profile image URL
        const res = await updateProfileAction({
            bio: bio,
            image_url: profileImageUrl,
            username: username,
        })

        console.log('Profile updated successfully', res);
        setOpen(false);
    }

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
                        <Field>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue={user.username} onChange={(e) => setUsername(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={user.bio ?? ""}
                                placeholder="Say something about yourself"
                                className="resize-none"
                                onChange={(e) => setBio(e.target.value)}
                            />
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
                        <button type="submit">Save changes</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}