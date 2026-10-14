#!/bin/sh
# Regenerates sound effects + music bed with ffmpeg (run from pub-location/audio)
A="ffmpeg -v error -y -f lavfi -i"
$A "aevalsrc='0.45*sin(2*PI*1568*t)*exp(-22*t)*lt(t,0.14)+0.45*sin(2*PI*2093*(t-0.12))*exp(-14*(t-0.12))*gte(t,0.12)':s=48000:d=0.6" -ac 2 ping.wav
$A "aevalsrc='0.4*sin(2*PI*(500*t+2200*t*t))*exp(-18*t)':s=48000:d=0.25" -ac 2 sent.wav
$A "anoisesrc=c=pink:d=0.9:a=0.6:r=48000" -af "bandpass=f=1200:w=900,afade=t=in:d=0.45:curve=exp,afade=t=out:st=0.45:d=0.45" -ac 2 whoosh.wav
$A "aevalsrc='0.22*(sin(2*PI*1047*t)*exp(-4*t)+gte(t,0.09)*sin(2*PI*1319*(t-0.09))*exp(-4*(t-0.09))+gte(t,0.18)*sin(2*PI*1568*(t-0.18))*exp(-4*(t-0.18))+gte(t,0.27)*sin(2*PI*2093*(t-0.27))*exp(-3*(t-0.27)))':s=48000:d=1.8" -ac 2 chime.wav
$A "aevalsrc='0.8*sin(2*PI*(48*t+30*exp(-6*t)))*exp(-2.2*t)':s=48000:d=2" -af "lowpass=f=200" -ac 2 impact.wav
$A "aevalsrc='0.06*(sin(2*PI*2637*t)+sin(2*PI*3136*t)+sin(2*PI*3951*t))*(0.5+0.5*sin(2*PI*7*t))*min(t*2,1)*exp(-1.2*t)':s=48000:d=2.5" -ac 2 shimmer.wav
$A "aevalsrc='0.85*sin(2*PI*(45*mod(t,0.5)+4.4*(1-exp(-25*mod(t,0.5)))))*exp(-7*mod(t,0.5))+0.12*(random(0)*2-1)*exp(-55*mod(t+0.25,0.5))+0.06*(random(1)*2-1)*exp(-90*mod(t,0.125))*gte(t,11)+0.16*(2*gt(sin(2*PI*55*t),0)-1)*exp(-5*mod(t,0.25))*gte(t,0.5)+0.05*sin(2*PI*220*t)+0.04*sin(2*PI*329.6*t)+0.035*sin(2*PI*415.3*t)':s=48000:d=37" -af "lowpass=f=5000,acompressor=threshold=0.3:ratio=4,afade=t=in:d=0.3,afade=t=out:st=34.5:d=2.5,volume=1.4" -ac 2 music.wav
