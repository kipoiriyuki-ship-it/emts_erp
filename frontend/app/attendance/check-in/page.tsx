"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Camera, 
  MapPin, 
  CheckCircle, 
  Clock,
  User,
  AlertCircle
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { attendanceApi } from "@/lib/api/attendance"

export default function CheckInPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    // Get GPS location using Browser API
    getCurrentLocation()

    return () => {
      clearInterval(timer)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsGettingLocation(false)
      },
      (error) => {
        setLocationError(`Unable to retrieve location: ${error.message}`)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please ensure camera permissions are granted.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const handleTakePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const photoDataUrl = canvas.toDataURL('image/jpeg')
      setPhotoData(photoDataUrl)
      setPhotoTaken(true)
      stopCamera()
    }
  }

  const handleRetakePhoto = () => {
    setPhotoTaken(false)
    setPhotoData(null)
    startCamera()
  }

  const handleCheckIn = async () => {
    if (!location) {
      alert("Please enable location services to check in")
      return
    }

    setIsCheckingIn(true)
    
    try {
      await attendanceApi.checkIn({
        lat: location.lat,
        lng: location.lng,
        photo_url: photoData || undefined
      })
      alert("Check-in successful!")
      // Redirect or update UI
    } catch (error: any) {
      alert(`Check-in failed: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsCheckingIn(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check In</h1>
          <p className="text-muted-foreground mt-1">Record your attendance for today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Camera & Location */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!photoTaken ? (
                    <>
                      {!stream ? (
                        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                          <div className="text-center">
                            <Camera className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Click to start camera</p>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={stream ? handleTakePhoto : startCamera}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {stream ? "Take Photo" : "Start Camera"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        {photoData && (
                          <img src={photoData} alt="Captured photo" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleRetakePhoto}
                        variant="outline"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Retake Photo
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Current Location</span>
                    </div>
                    {isGettingLocation ? (
                      <p className="text-sm text-muted-foreground">Detecting location...</p>
                    ) : locationError ? (
                      <p className="text-sm text-red-600">{locationError}</p>
                    ) : location ? (
                      <p className="text-sm">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Location not detected</p>
                    )}
                  </div>
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Location verified</span>
                    </div>
                  )}
                  {!location && !isGettingLocation && (
                    <Button 
                      className="w-full" 
                      onClick={getCurrentLocation}
                      variant="outline"
                      size="sm"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Retry Location
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Check In Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentTime.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">Budi Santoso</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee ID</span>
                    <span className="font-medium">EMP-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">Project Management</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shift</span>
                    <span className="font-medium">08:00 - 17:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check In Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Photo</span>
                    </div>
                    <Badge variant={photoTaken ? "success" : "destructive"}>
                      {photoTaken ? "Complete" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Location</span>
                    </div>
                    <Badge variant={location ? "success" : "destructive"}>
                      {location ? "Verified" : "Required"}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={!photoTaken || !location || isCheckingIn}
                  >
                    {isCheckingIn ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In Now
                      </>
                    )}
                  </Button>
                  {!photoTaken && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 p-2 bg-amber-50 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please take a photo before checking in</span>
                    </div>
                  )}
                  {!location && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 p-2 bg-amber-50 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please enable location services</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
