"use client";

import React, { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { User } from "@supabase/supabase-js";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
        <img
          src="/placeholder-avatar.png"
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />
      </div>
      <p className="text-gray-600 mb-4">{profile.bio}</p>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span className="mr-4">{profile.followers} followers</span>
        <a href={profile.website} className="text-blue-500 hover:underline">
          {profile.website}
        </a>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Edit profile
      </button>
    </div>
  );
};

export default ProfilePage;
