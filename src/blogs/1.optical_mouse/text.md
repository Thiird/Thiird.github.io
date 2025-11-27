<h1 style="text-align:center; font-size:2em; font-weight:bold;">
  Custom Desktop Mouse
</h1>

<img src="mouse_exploded.png" style="width:100%; max-width:600px; display:block; margin:auto;">

<h2>Table of Contents</h2>

<div class="custom-index">
  <ul>
    <li class="index-section"><a href="#intro">Intro</a></li>
    <li class="index-section"><a href="#specifications">Specifications</a></li>
    <li class="index-section">
      <a href="#hardware">Hardware</a>
      <ul class="index-subsection">
        <li><a href="#voltage-rails">Voltage rails</a></li>
        <li><a href="#rotary-encoder">Rotary encoder</a></li>
        <li><a href="#switches">Switches</a></li>
        <li><a href="#battery">Battery</a></li>
      </ul>
    </li>
    <li class="index-section"><a href="#firmware">Firmware</a></li>
    <li class="index-section"><a href="#mechanical">Mechanical</a></li>
    <li class="index-section"><a href="#app">Mouse client</a></li>
    <li class="index-section"><a href="#result">Result</a></li>
    <li class="index-section"><a href="#conclusions">Conclusions</a></li>
  </ul>
</div>

<h1 id="intro">Intro</h1>

This blog post is about a desktop mouse that I built for myself.

It features:

- nRF52 MCU (USB/BLE connectivity)
- PAW3395 SPI gaming optical sensor
- 16340 Li-ion rechargeable battery
- BQ24232RGTR charging circuit
- D2F-01F mechanical switches

<a id="specifications"></a>

<h1 id="specifications">Specifications</h1>

The general characteristic of the mouse I wanted were:

- 2 front buttons, 2 side buttons, 1 wheel button
- Bluetooth and USB communication

<h1 id="hardware">Hardware</h1>

The PCB design was done is KiCAD.
<embed src="mouse_sch.pdf" type="application/pdf" width="100%" height="600px" />

[<img class="click-zoom" style="width:100%;max-width:600px;">](mouse_layout.png)

Instead of having the mouse directly connect to the PC via Bluetooth, I decided to design a receiver too, so that I would get to design with the receiving side too.

<embed src="receiver_sch.pdf" type="application/pdf" width="100%" height="600px" />

[<img class="click-zoom" style="width:100%;max-width:600px;">](receiver_layout.png)

<h2 id="voltage-rails">Voltage rails</h2>

Let's address the elephant in the room: why three voltage rails for a freaking desktop mouse?

- The 5V rail is mandatory as the switches I used have a minimum rating of 5V@1ma, as a matter of fact, no mouse switch exist that can lower than that, because it would require noble materials to lower the wetting current of the electrical contact. See above video for a more thorough explanation.

- The 3.3V rail I deemed necessary as the chip [uses more power at lower voltages](https://devzone.nordicsemi.com/power/w/opp/2/online-power-profiler-for-bluetooth-le), this was my first battery powered product and I was concerned about battery life.

- The 1.9V rail is necessary by the optical sensor.

I agree three voltage rails is a bit ridiculous, but I believe I have vaid technical reasons and this is my mouse nonetheless :).

<h2 id="rotary-encoder">Rotary encoder</h2>

The rotary encoder is a TTC 24-teeth tactile mechanical encoder bought on AliExpress.

[<img class="hover-effect click-zoom" style="width:100%;max-width:600px;">](q_dec.png)

<h2 id="switches">Switches</h2>

The switches are D2F-01F mechanical switches, the so called Japanese Omron. They are the best quality mouse switch one can get (over €1 per switch!). I bought a few just in case they become hard to find.
I initially experimented with MillMax sockets to make the switches hand-swappable for when they will wear out, but in the end I just soldered them in place, as they are easy enough to de-solder.

<h2 id="battery">Battery</h2>

As a battery, a wireless mouse usually uses a lithium pouch connected via an
I personally didn't like this solution, I wanted something more "hotswappable", so I opted for a 16340 battery and the most lightweight battery clips I could find. In particular I'm using a Vapcell 16340 T8 850mah 3A, bought directly from the manufacturer.

<h1 id="firmware">Firmware</h1>

The firmware was custom made in C with the NRF Connect SDK, version `2.4.2`.
Nordic Semiconductor forums are awesome and the support for both learning and technical reviews is incredible!
Even for single users like me.

I had never worked with a vendor SDK, so I approached this the following way.

My firmware needed to be able to do a lot of things:

- BLE/USB communication
- SPI
- Buttons reading
- Wheel reading
- Battery reading
- USB COM port

Apart from the button reading (simple GPIO reading), everything was new to me. I couldn't just start writing the `main.c` of the firmware, I had a lot of learning to do before that.

So I tackled these functionalities one by one. Lucky for me the nRF Connect SDK has samples for pretty much every single thing you use the MCU for.  
One by one, I took a look at the sample for the functionality I needed to learn, flashed it to my board, tested it there, and made sure I understood how the code worked. Once that was done, I would keep the working and understood code on my PC and move to the next functionality. Once every one of them was tackled, I had a better idea of what the firmware for my mouse needed to look like, so I started from the biggest of the samples that I had studied, in this case the Mouse BLE sample, and slowly started to merge the other samples into it.

The programming of the mouse is done via SWD through a J-Link and a Tag-Connect TC2030 connector.

<h1 id="mechanical">Mechanical</h1>

The case is 3D printed in Nylon, externally modeled in Blender to honor my previous mouse, a Perixx MX-1000, and internally in Fusion360 to snap/press fit the PCB.
Everything is held together by just one, easily accessible screw.
This was a nice opportunity to dust off my 3D modeling skills in Blender and some mechanical engineering with the leaf springs for both the front and side buttons.

I am not a mechanical engineer, but I really like to design mechanical components.
The simplicity of creating precise components with just a few clicks really appeals to me, especially after years of dabbling in computer graphics softwares like Cinema4D, Maya and Houdini, where modeling is mostly done by hand, polygon by polygon.

You can design anything in Maya and it will render out fine. You can't design something in CAD and expect it to be manufacturable or usable: the production process needs to be take into account.
For example, see there pillars?
<img>
They were not there in the first version of the shell.
As soon as I held it for the first time, I realized plastic bends (duh), and so I had to add those pillars in to support the structure when squeezing the mouse between your thumb and ring finger.

The mouse wheel was modeled in Fusion360 to look like the one in the Perixx MX-1000 and was 3D printed in SLA LEDO 6060 resin. 3D printing accuracy is what it is, and so the wheel shaft that is inserted inside the rotary encoder doesn't have the best tolerance: there is some play in it, making it a little mushy. The softness of the plastic used for printing is such that the hex shape rounds off over time, making it even worse.

<a id="result"></a>

<h1 id="result">Result</h1>

The mouse weights ~87 grams, which is an improvement over the ~130 grams of the Perixx MX-1000.

Mechanically wise, the mouse is sturdy and feels good in the hand.
The bottom is not 100% flat, so a slight wobble can be noticed if one pays attention to it. During normal use this not perceivable.

Hardware wise, everything is fine, the battery holds the charge for around 4/5 days of full-time usage and it takes around two hours to fully charge.
This is my first battery powered project, so that's good enough for me.

Firmware wise, the only gripe I have is the SPI reading routine.
For some reason that I have yet to discover, when I move the mouse in the negative X/Y axis (left and up), the read glitches to very high motion values, resulting in a jump of the cursor on screen.

I suspect my SPI reading routine is wrong (timing wise). I am probably missing something horribly obvious, but I can't understand what it is. A user on reddit suggested that this issue is present on both positive and negative movement, but shows up only on the negative axis because of how two's complement works. I think he is right, and I have stared at the code and datasheet enough that I don't know what to do anymore if not hooking up a protocol analyzer or oscilloscope to check if something is off. I have zero equipment with me at the moment, as I sold everything before a recent move, so I'm left without options.

So far I have fixed for this by just applying a very, very crude low pass filter to the motion values.

A particular mouse combo makes the mouse store the last 2000 motion readings from the optical sensor in the MCU EEPROM. I store both the filtered and unfiltered values.
With the magic of Python and MathPlotLib we can visualize this data.
[<img class="hover-effect click-zoom" style="width:100%;max-width:600px;">](motion_glitch_plot.png)

Zooming in on the second blue spike from the right, we can clearly see the low pass filter in effect.
[<img class="hover-effect click-zoom" style="width:100%;max-width:600px;">](motion_glitch_plot_zoom.png)

With this filter in place, the mouse works smoothly and nothing wrong can be perceived during normal use.

The following is simplified version of the read routine.
<pre><code class="language-c">
SPI_read_register(0x02, &motion);
SPI_read_register(0x03, &xl);
SPI_read_register(0x04, &xh);
SPI_read_register(0x05, &yl);
SPI_read_register(0x06, &yh);

xl_filtered = xl;
xh_filtered = xh;
yl_filtered = yl;
yh_filtered = yh;

x_combined = (int16_t)((xh << 8) | xl);
y_combined = (int16_t)((yh << 8) | yl);

if (x_combined != 0)
{
    x_condition = abs(x_combined) > (abs(x_combined_last) * m);
    // if jump  occurred skip this movement
    if (x_condition)
    {
        xl_filtered = 0x00;
        xh_filtered = 0x00;
    }
    else
    {
        x_combined_last = x_combined;
    }
}

if (y_combined != 0)
{
    y_condition = abs(y_combined) > (abs(y_combined_last) * m);
    // if jump  occurred skip this movement
    if (y_condition)
    {
        yl_filtered = 0x00;
        yh_filtered = 0x00;

    }
    else
    {
        y_combined_last = y_combined;
    }
}
</code></pre>

Overall, I have been using it for a number of months, and I'm very happy with it.

<h1 id="app">Mouse client</h1>

I also made a small desktop app that connects to the COM port exposed by the mouse and it shows statistics about button presses.
This stats gathering was made mostly as a "could I do it if I wanted" kind of thing, but it can actually be useful for maintenance (after N clicks replace the switch).

I have a ich for keeping track of things, and doing statistical analysis over everything in my life, and this app certainly helps me scratch it.

The app starts at system startup and sits on the system tray-bar. Whenever the mouse is connected via USB to the PC for charging, it detects that, connects to its COM port and logs the mouse statistics on a CSV file. When the mouse is disconnected it connects to the mouse receiver to alert the user about low battery level with a sound notification.

[<img class="hover-effect click-zoom" style="width:60%;">](mouse_client.png)

_The battery level bug was later fixed._

<h1 id="conclusions">Conclusions</h1>

This project brought me down several rabbit holes, one of them was studying [how make mechanical switches last a long time](https://www.youtube.com/watch?v=v5BhECVlKJA). It turns out there is a reason if modern gaming mouse switches last so long and older ones didn't have longevity problems.

Everything was hand assembled (even the 0201 components for the BLE antenna!).

Often I see people ask online for "project ideas".  
My suggestion is to fix a problem you have with a project, that's exactly how this project came to be: my previous mouse was falling apart and I needed a big project to help me secure my first job.

Here is a clip of me playing Battlefield 4 with my mouse!

<video controls class="video-player">
  <source src="bf4.mp4" type="video/mp4">
</video>

<h1 id="pic_dump">Picture dump</h1>

<div class="image-grid">
  <img class="hover-effect click-zoom" src="antenna_assembly.jpg" alt="MCU and antenna assembly" />
  <img class="hover-effect click-zoom" src="early_shell_prototype.jpg" alt="shell" />
  <img class="hover-effect click-zoom" src="man_cave.jpg" alt="Where the mouse was built" />
  <img class="hover-effect click-zoom" src="new_vs_old.jpg" alt="new vs old" />
  <img class="hover-effect click-zoom" src="fusion.png" alt="Fusion 360 view" />
  <img class="hover-effect click-zoom" src="blender.png" alt="Blender view" />
  <img class="hover-effect click-zoom" src="voltage_rails_debugging.jpg" alt="Debugging the voltage supervisor" />
  <img class="hover-effect click-zoom" src="mouse_final_1.jpg" alt="" />
  <img class="hover-effect click-zoom" src="mouse_final_2.jpg" alt="" />
  <img class="hover-effect click-zoom" src="mouse_final_3.jpg" alt="" />
  <img class="hover-effect click-zoom" src="mouse_final_4.jpg" alt="" />
</div>
