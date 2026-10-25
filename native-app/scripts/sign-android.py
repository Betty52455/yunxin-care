"""Sign an already-built release using an owner-only local key; never print secrets."""
from pathlib import Path
import os,subprocess
root=Path(__file__).resolve().parents[1]
sdk=root/'.tools/android-sdk/build-tools/36.0.0'
env=dict(os.environ)
env['JAVA_HOME']=str(root/'.tools/jdk21/jdk-21.0.12.1+1/Contents/Home')
out=root/'artifacts';out.mkdir(exist_ok=True)
aligned=out/'yunxin-aligned.apk'
apk=out/'孕心智护-Android-1.0.apk'
unsigned=root/'android/app/build/outputs/apk/release/app-release-unsigned.apk'
subprocess.run([str(sdk/'zipalign'),'-f','-p','4',str(unsigned),str(aligned)],check=True,env=env)
subprocess.run([str(sdk/'apksigner'),'sign','--ks',str(root/'.signing/yunxin-release.p12'),'--ks-key-alias','yunxin','--ks-pass','file:'+str(root/'.signing/release-password.txt'),'--out',str(apk),str(aligned)],check=True,env=env)
result=subprocess.run([str(sdk/'apksigner'),'verify','--verbose','--print-certs',str(apk)],check=True,env=env,capture_output=True,text=True)
(out/'android-signature.txt').write_text(result.stdout)
print(result.stdout)
