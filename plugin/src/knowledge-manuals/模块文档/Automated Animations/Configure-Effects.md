# Configuring Animations  
  
Animations in this module are simply Sequencer Macros with a User Interface. All options for a given Animation section configure out it should play.  In the Melee, Range, On Token, Templates and Aura menu there are 4 sections avaiable to set up an Animation.  
  
**The only NECESSARY section is the Primary Animation field, all others are optional.**  
  
These sections can be chained together to create unique Animation sequences in multiple ways. Below is the Option settings for the **Source Animation** section.  
<p align="center"> 
<img height=300 src=images/SourceOptions.png>
</p>  
<p align="center">
Note that detailed information for these can be found in the Primary Section by clicking the Blue Info icon next to Options
</p>
  
## **Chaining Effects with Delay/Wait**
If we were to chain multiple effects together and each option section is set with a Delay (not Wait), all animation sections would start from 0 and each would be delayed by the number input into this Option in milliseconds. 
  
Alternatively, you can mix the use of Wait and Delay to set timings for each effect chain. Below we have a **WAIT** set for the **Source FX** and **Primary** sections. This field accepts a negative or postiive number, and determines when the next animation will start based on when the current animation ends.
<p align="center"> 
<img height=200 src=images/Chaining01.png>
</p>  
  
By using **WAIT**, this refers to the ``waitUntilFinished()`` method in Sequencer. If paired with a Persistent effect, you can have "end" animations play after the effect is removed. For Example using **WAIT** in the Primary section as a Persistent effect (Ontoken or Aura menu) with a Secondary Animation enabled will only play the Secondary Animation AFTER the Primary animation has been removed.
  
## **Scaling Effects with Scale/Radius**  
Where available, you can change the way an animation is scaled by selecting either **SCALE** or **RADIUS** in the appropriate Options setting. A-A scales effects automatically to be slightly larger than a given token. For more control, you can select **RADIUS** to manually set the size of the Effect in grid size. The **RADIUS** option also enables the **Add Token Width** checkbox. When checked, it will add the size of the Token into the calculation of the effect size.  
  
## **Sounds**  
  
No matter how your animations are timed, the Sound for each section will ALWAYS start at the same time as the Animation. To help with this, there are 2 options for adjusting the timing of sounds.  
<p align="center"> 
<img height=200 src=images/Sound.png>
</p>  
  
1. **Start Time (ms):** Default 0 milliseconds, can be adjusted to tell Sequencer when the sound should start. Adding 1000 will start the Sound 1 second into its duration.  
2. **Delay:** Delay will add a duration in Milliseconds to delay the sound from playing.
  
## **Custom Animation files**  
<p align="center"> 
<img height=200 src=images/Custom.png>
</p>  
  
The Select dropdown menus are not always up-to-date in this module (It takes time). For non-JB2A animations, or those not yet in the menu, use the Custom selection field. You can choose to spawn a normal File Picker, or the Sequencer Database viewer.  
  

**This field accepts direct file paths, and Sequencer Database paths.**
