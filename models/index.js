const Sequelize = require("sequelize");

const db = new Sequelize("postgres://localhost:5432/wikistack", {
  logging: false
});

db.authenticate()
.then(() => {
  console.log('Connected to db successfully')
})


const Page = db.define("page", {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
    //since we are searching, editing, deleting by slug, these need to be unique
    unique: true
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM("open", "closed")
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    defaultValue: []
  }
});

Page.beforeValidate(page => {
  /*
   * make sure tags are an array
   */
  if (typeof page.tags === "string") {
    page.tags = page.tags.split(",").map(str => str.trim());
  }

  /*
   * Generate slug
   */
  if (!page.slug) {
    page.slug = page.title.replace(/\s/g, "_").replace(/\W/g, "").toLowerCase();
  }
});


Page.findByTag = async function(tag) {
  const pagesByTag = await Page.findAll({
    where: {
      tags: { $contains: [tag] }
    }
  });
  console.log(">>>>> this is pages in findByTag", pagesByTag)
  return pagesByTag
}

Page.prototype.findSimilar = async function() {
  // console.log('>>>> this >>>>', this)
  // const currentTags = this.tags
  // console.log('>>>>. currentTags >>>> ', currentTags)
  const similar = await Page.findAll({
    where: {
      id: { $ne: this.id },
      tags: { $overlap: this.tags }
    }
  });
  // console.log('>>>>. similar >>>> ', similar)
  return similar;
}

// User model

const User = db.define("user", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    isEmail: true,
    allowNull: false
  }
});

//This adds methods to 'Page', such as '.setAuthor'. It also creates a foreign key attribute on the Page table pointing ot the User table
Page.belongsTo(User, {as: 'author'});
// User.hasMany(Page, { foreignKey: 'authorId'});

module.exports = {
  db,
  Page,
  User
};
