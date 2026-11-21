# B A L L B O U N C E R E P O

Initially this repo was created to serve up a web socket version of this [codepen](https://codepen.io/welshd1/pen/xxGEoxN).

As of October 2026, I have grown tired of AI programming. I created this repo to do fun things with JavaScript so I can rediscover my love of programming.

## Contributing
Feel free to open a PR with your own creations.

## Ball Orbits
<p align="center">
  <img src="https://media.discordapp.net/attachments/839537328741417031/1571519567891529929/20261115-1337-14.5353618.gif?ex=6afb0726&is=6af9b5a6&hm=29186e1bc602a3ce70dba6ef0e7b5f045c46825b871ab171986c389aaca1105c" alt="animated" />
</p>

The ball orbit project was born out of the ball bounce codepen mentioned above. I (doov) had talked about trying to make the bouncing balls collide with one another. Someone on Discord asked if they had gravitational pull on one another. That was the start of this idea.

### Functionality
The ball orbits project is written without any external libraries and is entirely vanilla JS. For anybody that wants to contribute, a fun contribution might be adding shapes besides circles by inheriting the logic from the `shape` class and designing how it renders.

### Future State
The goal of this project is to be able to save the state of a gravity board in a db as a serialized document, enabling users to share their designs with one another via links.


## Credits
### Thank you for carry PB/Arch
When writing up the starting code for the gravity math, discord users probablybutter (PB) and cynicalfrost (Arch) were very helpful in writing up the original functions.

Arch pointed out the importance of the atomicity of each element on the board exerting gravity on the other elements.

PB remembered all the physics equations that I forgot or never learned in high school and gave them to me.

### Backend Structure
Backend structure modeled on [this article](https://www.geeksforgeeks.org/node-js/how-to-structure-my-application-in-express-js/) on [geeksforgeeks.org](https://www.geeksforgeeks.org).